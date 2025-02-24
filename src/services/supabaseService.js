// services/supabaseService.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL // This should work for Vite env variables
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY // Make sure you define these in your .env file

class SupabaseService {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    this.count = 0
   
  }

  // Upload multiple images to Supabase Storage
  async uploadImages(images) {
    console.log(`🔄 Running uploadImages for ${images.length} images`);
    try {
      this.count = 0
      const uploadResults = []

      for (const img of images) {
        if (!img.file || !img.userId || !img.name) {
          throw new Error('Missing required image properties')
        }

        const fileData = {
          name: `${img.userId}:${img.name.replaceAll(' ', '_')}`,
          file: img.file,
          type: img.file.type
        }

        const response = await this.uploadToSupabase(fileData)
        uploadResults.push(response)
        this.count++

        console.log('✅ Count after upload:', this.count);

        // Emit real-time progress update
        if (this.progressCallback) {
            this.progressCallback(this.count);
          }
      }
      console.log('🎯 Final count:', this.count);
      return uploadResults.length
    } catch (error) {
      console.error('❌ Error uploading images:', error)
      throw error
    }
  }

   // Method to set a callback for progress updates
   setProgressCallback(callback) {
    this.progressCallback = callback; // Only store the latest callback
  }

  // Function to upload single image to Supabase
  async uploadToSupabase(fileData) {
    try {
      const { name, file, type } = fileData

      if (!file || !type) {
        throw new Error('Missing file or content type')
      }

      // Upload the file to Supabase
      // eslint-disable-next-line no-unused-vars
      const { data, error: uploadError } = await this.supabase.storage
        .from('images')
        .upload(`public/${name}`, file, {
          contentType: type,
          upsert: true // Prevent overwriting existing files
        })

      if (uploadError) throw uploadError

      return {
        success: true
      }
    } catch (error) {
      console.error(`Failed to upload image ${fileData.name}:`, error)
      throw new Error(`Failed to upload image ${fileData.name}: ${error.message}`)
    }
  }
}

const supabaseService = new SupabaseService()
export default supabaseService
