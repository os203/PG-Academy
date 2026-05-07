# Features to Build

## 4.1 Login & Registration
*   Register with name, email, and password. Passwords are stored encrypted.
*   Login returns a secure token (JWT). Tokens expire after 15 minutes for security.
*   Password reset via email link.
*   Every page/API checks the user's role before showing content.

## 4.2 Course Management
*   Create courses: title, description, thumbnail, price, category.
*   Organize into Modules → Lessons. Drag to reorder.
*   Each lesson: video + text + downloadable files.
*   Courses are either Draft (hidden) or Published (visible to students).
*   Admin assigns instructors to courses.

## 4.3 Video Streaming
*   Videos stored in a private folder not accessible by direct URL.
*   Backend checks enrollment before giving access to any video.
*   Videos stream in chunks (HLS) students cannot download full files.
*   Player supports speed control (0.5x–2x) and remembers where you stopped.

## 4.4 AI Assistant
*   Chat panel inside every lesson visible to enrolled students only.
*   AI reads the actual course content before answering (not the general internet).
*   Students can ask it to summarize the lesson or generate practice questions.

## 4.5 Quizzes
*   Attach a quiz to any lesson or module.
*   Question types: multiple choice, true/false.
*   Instructor sets passing score and max attempts.
*   Student sees results immediately. Instructor can lock next lesson until quiz is passed.

## 4.6 Payments
*   Buy individual courses (one-time) or subscribe monthly / annually.
*   Admin creates bundle packages (multiple courses, one price).
*   Admin creates coupon codes with percentage or fixed discounts.
*   Email invoice sent after every successful payment.
*   Admin sees financial dashboard: revenue, subscriptions, sales per course.

## 4.7 Student Experience
*   Dashboard: all enrolled courses with progress percentages.
*   Private notes per lesson (only the student sees them).
*   Wishlist: save courses to buy later.
*   Leave a star rating and review after completing a course.
*   Q&A: post questions under any lesson. Instructors reply.

## 4.8 Instructor Portal
*   See all students in your courses with their progress and quiz scores.
*   Download student performance as CSV.
*   Reply to student Q&A questions.

## 4.9 Admin Dashboard
*   KPIs: total users, revenue, active subscriptions, top courses.
*   Full course builder with drag-and-drop lesson ordering.
*   User management: assign roles, manually enroll students.
*   Coupon and bundle management.
