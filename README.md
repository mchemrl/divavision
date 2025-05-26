# Divavision

Divavision is a social movie platform where users can track and rate movies, create custom movie lists, follow other users, write reviews, and get personalized movie recommendations.

---

## Features

### User Profile
- Profile picture, username, registration date, and linked email
- Dashboard displaying movie rating streak, total movies rated, monthly rating chart, recent activity, and followers

### Movies
- Browse a curated list of movies with titles, ratings, and brief info
- Detailed movie page with extended info
- Add movies to your personal lists or favourites
- Write and share movie reviews

### Lists
- Create custom movie lists with titles, descriptions, and cover images
- Add and manage movies within your lists

### Info Dashboard
- Overview of movies rated, reviews written, and rating streaks

### Recommendation System
- Recommendations based on genres and actors
- Experimental TF-IDF clustering on movie descriptions
- Accessible via a dedicated page or within Discover

### Leaderboard
- Ranked list of users by most movies rated

### Social Features
- Follow other users and gain followers
- Achievement badges to reward activity
- Feed showing reviews by followed users in chronological order

---

## App Architecture

### Frontend Pages
- **Landing:** Welcome and introduction page
- **LoginPage:** User authentication
- **ProfilePage:** User dashboard and activity
- **Discover:** Browse and search movies and recommendations
- **Lists:** Manage custom movie lists
- **ForYouPage:** Personalized recommendations and feed

### Backend
- Powered by Flask for RESTful API services

### Database
- Supabase for user, movie, and list data storage

### Data Science Layer
- Simple recommendation engine utilizing genre and actor similarity
- TF-IDF clustering for movie descriptions 

---

## Tech Stack & API Integrations

- **Backend:** Flask
- **Frontend:** React, D3.js (for charts)  
- **Database:** Supabase  

### External APIs
- **SMTP:** For email verification during user registration  
- **Google Auth:** OAuth integration for user authentication  

---

## Getting Started

### Prerequisites
- Node.js and npm/yarn
- Python 3.8+
- Supabase account and project

### Installation

1. Clone the repository
   
       ```bash
       git clone https://github.com/mchemrl/divavision.git
       cd divavision
   
2. Setup backend

    Create and activate a Python virtual environment

    Install backend dependencies:

        ```bash
        pip install -r requirements.txt

    Configure environment variables for Supabase and APIs

3. Setup frontend

        ``` bash
        cd frontend
        npm install
        npm start

4. Run backend server

        ```bash
        python server/run.py
