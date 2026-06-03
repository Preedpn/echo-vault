# echo-vault
EchoVault: Acoustic Fingerprint Scanner &amp; Plagiarism Detector
EchoVault is a real-time, automated audio security pipeline designed to detect duplicate uploads and audio plagiarism. Built with an Angular frontend and a Node.js/Express backend, the system leverages a fully live AWS integration (S3 storage and serverless Lambda functions) to analyze the actual mathematical signatures of track files instead of relying on random mock values.
 🚀 System Architecture & Live Pipeline

The application bypasses traditional server-heavy media uploads by streaming binary chunks directly to the cloud, executing analysis on a serverless layer:

1. Token Handshake: The Angular client requests a secure cryptographic Pre-signed URL from the Node.js backend wrapper.
2. Direct Binary Streaming:The frontend converts the audio file into a raw `ArrayBuffer` and streams it directly to an Amazon S3 Bucket, keeping the backend lightweight and fast.
3. Serverless Analysis Trigger: The instant the file lands in S3, an automated event trigger fires an AWS Lambda Function.
4. Acoustic Profiling: The Lambda engine reads the track binary bytes, executes a peak-transient evaluation to extract structural data nodes (fingerprint), and runs a statistical variance algorithm against existing records in MongoDB Atlas.
5. Real-time UI Status: The dashboard interface automatically transitions from `Pending` to `Completed`, displaying an active duplicate warning flag or an original verification badge based on a computed threshold match percentage.

## 🛠️ Tech Stack

- Frontend: Angular (v17+), TypeScript, RxJS, HttpClient
- Backend: Node.js, Express, Mongoose
- Cloud Infrastructure: AWS S3 (Simple Storage Service), AWS Lambda (Serverless Compute Engine)
- Database: MongoDB Atlas (Cloud NoSQL Cluster)

## 📂 Project Structure

├── backend/
│   ├── models/
│   │   └── recording.js        # MongoDB database schema structure
│   ├── routes/
│   │   └── upload.js           # API endpoints (Initialization & Confirmation)
│   ├── services/
│   │   └── s3.service.js       # AWS S3 Pre-signed URL generation manager
│   ├── .env                    # Private environmental credentials (Secret)
│   └── server.js               # Node app listener entrypoint
│
├── frontend/
│   └── src/app/
│       ├── components/
│       │   ├── upload-interface/ # Binary conversion & S3 uploader stream
│       │   └── dashboard/        # Dynamic audio tracking interface cards
│       └── services/
│           └── upload.service.ts # Reactive data provider endpoints mapper
⚙️ Configuration & Environment Setup
1. Backend Environment Setup
Create a .env file inside your backend/ directory with the following variables:

Code snippet
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=echo-vault-recording-pritidipan


2. S3 Bucket CORS Rules
To allow your frontend application running on localhost:4200 to stream files directly to Amazon, apply this JSON array within your S3 Bucket Permissions Dashboard:

JSON
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
        "AllowedOrigins": ["http://localhost:4200"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
3. S3 Bucket Policy (Write Authorization)
Ensure your bucket allows incoming external object streams by applying this access statement rule:

JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowExternalUploads",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:PutObject", "s3:GetObject"],
            "Resource": "arn:aws:s3:::echo-vault-recording-pritidipan/*"
        }
    ]
}
🏃‍♂️ How to Run Locally
Start Backend Server
Bash
cd backend
npm install
npm run dev
Start Frontend Application
Bash
cd frontend
npm install
ng serve
Open http://localhost:4200 in your browser to view the operational dashboard pipeline.
