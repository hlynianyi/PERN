const { pool, withTransaction } = require("../utils/database");
const fs = require("fs").promises;
const path = require("path");

class Homepage {
  static async initTable() {
    try {
      await pool.query(
        `DROP TABLE IF EXISTS homepage_popular_products CASCADE`
      );
      await pool.query(`DROP TABLE IF EXISTS homepage_carousel CASCADE`);
      await pool.query(`DROP TABLE IF EXISTS homepage CASCADE`);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS homepage (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS homepage_carousel (
          id SERIAL PRIMARY KEY,
          homepage_id INTEGER REFERENCES homepage(id) ON DELETE CASCADE,
          image_url VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          product_link VARCHAR(255) NOT NULL,
          order_index INTEGER NOT NULL CHECK (order_index >= 0 AND order_index < 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE OR REPLACE FUNCTION check_carousel_images_count()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (
            SELECT COUNT(*)
            FROM homepage_carousel
            WHERE homepage_id = NEW.homepage_id
          ) >= 5 THEN
            RAISE EXCEPTION 'Maximum number of carousel images (5) exceeded';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await pool.query(`
        DROP TRIGGER IF EXISTS check_carousel_images_count_trigger ON homepage_carousel;
        CREATE TRIGGER check_carousel_images_count_trigger
        BEFORE INSERT ON homepage_carousel
        FOR EACH ROW
        EXECUTE FUNCTION check_carousel_images_count();
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS homepage_popular_products (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id)
        );
      `);

      await pool.query(`
        CREATE OR REPLACE FUNCTION update_homepage_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await pool.query(`
        DROP TRIGGER IF EXISTS update_homepage_timestamp ON homepage;
        CREATE TRIGGER update_homepage_timestamp
        BEFORE UPDATE ON homepage
        FOR EACH ROW
        EXECUTE FUNCTION update_homepage_timestamp();
      `);

      const { rows } = await pool.query("SELECT COUNT(*) FROM homepage");

      await pool.query(`
        INSERT INTO homepage (title, description) 
        VALUES ('Добро пожаловать', 'Описание вашей компании')
      `);
    } catch (error) {
      console.error("Error initializing homepage tables:", error);
      throw error;
    }
  }

  static async getHomepage() {
    const { rows } = await pool.query(`
      SELECT 
        h.*,
        COALESCE(
          (
            SELECT json_agg(carousel_data ORDER BY carousel_data->>'order_index')
            FROM (
              SELECT jsonb_build_object(
                'id', hc.id,
                'image_url', hc.image_url,
                'name', hc.name,
                'product_link', hc.product_link,
                'order_index', hc.order_index
              ) AS carousel_data
              FROM homepage_carousel hc
              WHERE hc.homepage_id = h.id
            ) sub
          ), 
          '[]'::json
        ) as carousel_images,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'order_index', hpp.order_index
              )
              ORDER BY hpp.order_index
            )
            FROM homepage_popular_products hpp
            JOIN products p ON p.id = hpp.product_id
          ),
          '[]'::json
        ) as popular_products
      FROM homepage h
      LIMIT 1
    `);
    return rows[0] || null;
  }

  static async update(homepageData) {
    return await withTransaction(async (client) => {
      const {
        id,
        title,
        description,
        imageMetadata,
        deletedImages,
        popularProducts,
        files,
      } = homepageData;

      await client.query(
        `UPDATE homepage SET title = $1, description = $2 WHERE id = $3`,
        [title, description, id]
      );

      if (deletedImages && deletedImages.length > 0) {
        const { rows } = await client.query(
          `SELECT image_url FROM homepage_carousel WHERE id = ANY($1)`,
          [deletedImages]
        );

        await client.query(`DELETE FROM homepage_carousel WHERE id = ANY($1)`, [
          deletedImages,
        ]);

        for (const row of rows) {
          try {
            const fullPath = path.join(process.cwd(), "public", row.image_url);
            await fs.unlink(fullPath);
          } catch (error) {
            console.error(`Error deleting file ${row.image_url}:`, error);
          }
        }
      }

      if (files?.images) {
        const images = Array.isArray(files.images)
          ? files.images
          : [files.images];
        const metadata = JSON.parse(imageMetadata || "[]");

        const {
          rows: [{ max_order }],
        } = await client.query(
          `SELECT COALESCE(MAX(order_index), -1) as max_order FROM homepage_carousel WHERE homepage_id = $1`,
          [id]
        );

        let orderIndex = max_order + 1;

        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const imageData = metadata[i] || {};
          const imageUrl = `/uploads/homepage/${file.filename}`;

          await client.query(
            `INSERT INTO homepage_carousel 
             (homepage_id, image_url, name, product_link, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              imageUrl,
              imageData.name || file.originalname,
              imageData.product_link || "",
              orderIndex + i,
            ]
          );
        }
      }

      if (popularProducts) {
        await client.query("DELETE FROM homepage_popular_products");

        const productIds = Array.isArray(popularProducts)
          ? popularProducts
          : JSON.parse(popularProducts);

        for (let i = 0; i < productIds.length; i++) {
          await client.query(
            `INSERT INTO homepage_popular_products (product_id, order_index)
             VALUES ($1, $2)
             ON CONFLICT (product_id) DO UPDATE 
             SET order_index = EXCLUDED.order_index`,
            [parseInt(productIds[i]), i]
          );
        }
      }

      return this.getHomepage();
    });
  }

  static async updateImageMetadata(imageId, metadata) {
    return await withTransaction(async (client) => {
      await client.query(
        `UPDATE homepage_carousel 
         SET name = $1, product_link = $2
         WHERE id = $3`,
        [metadata.name, metadata.product_link, imageId]
      );

      return this.getHomepage();
    });
  }

  static async updateImagesOrder(imageIds) {
    return await withTransaction(async (client) => {
      for (let i = 0; i < imageIds.length; i++) {
        await client.query(
          `UPDATE homepage_carousel SET order_index = $1 WHERE id = $2`,
          [i, imageIds[i]]
        );
      }

      return this.getHomepage();
    });
  }

  static async deleteImage(imageId) {
    return await withTransaction(async (client) => {
      // First, get the image URL so we can delete the file
      const { rows } = await client.query(
        `SELECT image_url FROM homepage_carousel WHERE id = $1`,
        [imageId]
      );

      if (rows.length === 0) {
        throw new Error("Image not found");
      }

      const imageUrl = rows[0].image_url;

      // Delete the database record
      await client.query(`DELETE FROM homepage_carousel WHERE id = $1`, [
        imageId,
      ]);

      // Delete the file from the filesystem
      try {
        const filePath = path.join(process.cwd(), "public", imageUrl);
        await fs.unlink(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file ${imageUrl}:`, error);
        // Continue with the transaction even if file deletion fails
      }

      return { success: true, deletedImage: imageUrl };
    });
  }
}

module.exports = Homepage;
