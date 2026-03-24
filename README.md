# Cloud-Based Online Survey Application

A full‑stack web application for creating, managing, and conducting online surveys. Built as part of SOEN 487 (Web Services and Applications) at Concordia University.

## Features

- **Administrator**  
  - Register / login with email & password (JWT / Firebase Auth)  
  - Create, edit, delete surveys (title, description, expiry date)  
  - Add multiple question types: multiple choice, checkbox, short answer, rating scale  
  - Mark questions as optional or required  
  - Publish surveys and generate unique participant links  
  - Upload participant emails and send invitation emails with survey links  
  - View analytics: response count, response rate, charts (pie/bar), and individual responses  

- **Participant**  
  - Receive email invitation with unique survey link  
  - Access survey after validation (token, expiry, not submitted)  
  - Answer questions with required validation  
  - Submit responses and receive confirmation message  
