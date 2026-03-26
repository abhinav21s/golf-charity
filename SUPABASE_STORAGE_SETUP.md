# Supabase Storage Setup for Winner Proof Uploads

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Enter the following details:
   - **Name**: `uploads`
   - **Public bucket**: ✅ Check this box (we need public URLs for images)
   - **File size limit**: 5 MB (optional)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg, image/jpg, image/png, image/gif`
6. Click "Create bucket"

## Step 2: Set Up Storage Policies (Important!)

After creating the bucket, you need to set up policies to allow uploads and public access:

### Policy 1: Allow Authenticated Users to Upload

1. In the Storage page, click on your `uploads` bucket
2. Click on "Policies" tab
3. Click "New Policy"
4. Select "For full customization" → Click "Get started"
5. Enter the following:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: INSERT
   - **Target roles**: authenticated
   - **Policy definition**:
     ```sql
     (bucket_id = 'uploads'::text)
     ```
6. Click "Review" then "Save policy"

### Policy 2: Allow Public Read Access

1. Click "New Policy" again
2. Select "For full customization" → Click "Get started"
3. Enter the following:
   - **Policy name**: `Allow public read access`
   - **Allowed operation**: SELECT
   - **Target roles**: public
   - **Policy definition**:
     ```sql
     (bucket_id = 'uploads'::text)
     ```
4. Click "Review" then "Save policy"

## Step 3: Test the Setup

After setting up the bucket and policies:

1. Restart your backend server (if running locally)
2. Try uploading a proof image from the "My Winnings" page
3. The image should upload successfully and you'll see it in:
   - Supabase Dashboard → Storage → uploads → winner-proofs/

## Folder Structure in Storage

The uploaded files will be organized as:
```
uploads/
  └── winner-proofs/
      ├── proof-{winnerId}-{timestamp}.jpg
      ├── proof-{winnerId}-{timestamp}.png
      └── ...
```

## Troubleshooting

### Error: "new row violates row-level security policy"
- Make sure you created the INSERT policy for authenticated users
- Check that the policy's bucket_id matches 'uploads'

### Error: "Failed to upload image to storage"
- Verify the bucket name is exactly `uploads` (case-sensitive)
- Check that your Supabase credentials in `.env` are correct
- Make sure the bucket is set to "Public"

### Images not loading in admin panel
- Verify the SELECT policy for public access is created
- Check that the bucket is marked as "Public"
- Try accessing the image URL directly in your browser

## What Changed in the Code

The backend now:
1. Uses `multer.memoryStorage()` instead of disk storage
2. Uploads files directly to Supabase Storage
3. Stores the public URL in the database
4. No longer needs a local `uploads/` folder

This works seamlessly in both local development and production (Render).
