# SkillHub Server

The server-side of **SkillHub**, a full-stack online learning platform, built with Node.js, Express, and MongoDB. It provides APIs for authentication, course management, enrollment, and more, supporting the React frontend.  

---

## Features

- **User Authentication**  
  - Firebase Authentication (Email/Password & Google)  

- **Course Management (CRUD)**  
  - Create, Read, Update, Delete courses  
  - Stores course data in MongoDB  
  - Image uploads handled via imgbb  

- **Enrollment**  
  - Manage enrolled courses for each user  
  - Fetch user-specific enrollments  

- **Filtering & Searching**  
  - Filter courses by category or featured status  
  - Search courses by title  

- **Notifications**  
  - API responses include success/error messages to be displayed on the client side via toast notifications  

## Future modifications state

- **Middleware & Security**  
  - Private routes for authenticated users  
  - Input validation  
  - CORS enabled for client-server communication  

---

## Project Structure

