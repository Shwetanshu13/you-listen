# You-Listen API Documentation

## 🚀 Base Configuration

### Base URL

```
Development: http://localhost:3001
Production: [Your production URL]
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format

All endpoints return JSON responses with consistent structure:

```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isAdmin": false
    }
  }
}
```

### Login User

```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isAdmin": false
    }
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false
  }
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🎵 Songs Endpoints

### Get All Songs

```http
GET /songs
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search query for title/artist

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 180,
      "fileUrl": "/stream/1",
      "uploadedAt": "2025-07-22T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Upload Song (Admin Only)

```http
POST /songs/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `audio`: Audio file (MP3, WAV, M4A)
- `title`: Song title
- `artist`: Artist name

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Song Title",
    "artist": "Artist Name",
    "duration": 180,
    "fileUrl": "/stream/1"
  }
}
```

### YouTube Ingestion (Admin Only)

```http
POST /songs/youtube
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "title": "Custom Title (optional)",
  "artist": "Custom Artist (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-here",
    "message": "YouTube download started"
  }
}
```

### Stream Song

```http
GET /stream/:id
```

**Response:** Audio file stream (no JSON wrapper)

---

## ❤️ Likes Endpoints

### Get Liked Songs

```http
GET /likes/songs
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 180,
      "fileUrl": "/stream/1",
      "likedAt": "2025-07-22T10:00:00Z",
      "isLiked": true
    }
  ]
}
```

### Like a Song

```http
POST /likes/songs/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Song liked successfully"
}
```

### Unlike a Song

```http
DELETE /likes/songs/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Song unliked successfully"
}
```

---

## 🎼 Playlist Endpoints

### Get User Playlists

```http
GET /playlists
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Favorites",
      "description": "All my favorite songs",
      "isPublic": false,
      "createdAt": "2025-07-22T10:00:00Z",
      "updatedAt": "2025-07-22T10:00:00Z",
      "songCount": 15
    }
  ]
}
```

### Create Playlist

```http
POST /playlists
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "My New Playlist",
  "description": "Description of my playlist",
  "isPublic": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My New Playlist",
    "description": "Description of my playlist",
    "isPublic": false,
    "createdAt": "2025-07-22T10:00:00Z",
    "updatedAt": "2025-07-22T10:00:00Z"
  }
}
```

### Get Playlist Details

```http
GET /playlists/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Favorites",
    "description": "All my favorite songs",
    "isPublic": false,
    "createdAt": "2025-07-22T10:00:00Z",
    "updatedAt": "2025-07-22T10:00:00Z",
    "songs": [
      {
        "id": 1,
        "title": "Song Title",
        "artist": "Artist Name",
        "duration": 180,
        "fileUrl": "/stream/1",
        "addedAt": "2025-07-22T10:00:00Z"
      }
    ]
  }
}
```

### Update Playlist

```http
PUT /playlists/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Updated Playlist Name",
  "description": "Updated description",
  "isPublic": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Playlist Name",
    "description": "Updated description",
    "isPublic": true,
    "updatedAt": "2025-07-22T10:00:00Z"
  }
}
```

### Delete Playlist

```http
DELETE /playlists/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Playlist deleted successfully"
}
```

### Add Song to Playlist

```http
POST /playlists/:id/songs
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "songId": 5
}
```

**Response:**

```json
{
  "success": true,
  "message": "Song added to playlist successfully"
}
```

### Remove Song from Playlist

```http
DELETE /playlists/:id/songs/:songId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Song removed from playlist successfully"
}
```

---

## 📊 History & Analytics Endpoints

### Get Recently Played

```http
GET /history/recent
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional): Number of songs to return (default: 20)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 180,
      "fileUrl": "/stream/1",
      "lastPlayed": "2025-07-22T10:00:00Z",
      "playCount": 15
    }
  ]
}
```

### Get Most Played Songs

```http
GET /history/most-played
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional): Number of songs to return (default: 20)
- `timeframe` (optional): "week", "month", "year", "all" (default: "month")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 180,
      "fileUrl": "/stream/1",
      "playCount": 42,
      "lastPlayed": "2025-07-22T10:00:00Z"
    }
  ]
}
```

### Track Song Play

```http
POST /history/track
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "songId": 1,
  "duration": 180,
  "position": 120
}
```

**Response:**

```json
{
  "success": true,
  "message": "Play tracked successfully"
}
```

---

## 🔍 Search Endpoints

### Search Songs

```http
GET /songs/search
Authorization: Bearer <token>
```

**Query Parameters:**

- `q`: Search query (required)
- `limit` (optional): Number of results (default: 20)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 180,
      "fileUrl": "/stream/1",
      "relevanceScore": 0.95
    }
  ]
}
```

---

## 🚫 Error Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 400  | Bad Request - Invalid input data         |
| 401  | Unauthorized - Invalid or missing token  |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource doesn't exist       |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation failed |
| 429  | Too Many Requests - Rate limit exceeded  |
| 500  | Internal Server Error - Server error     |

---

## 🔧 Development Tips

### Axios Configuration (React/Next.js)

```javascript
// utils/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
  timeout: 10000,
});

// Add auth token to requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
```

### Error Handling

```javascript
try {
  const response = await axios.get("/songs");
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error("Error:", error.response.data.error);
  } else {
    // Network or other error
    console.error("Network error:", error.message);
  }
}
```

### File Upload Example

```javascript
const uploadSong = async (file, title, artist) => {
  const formData = new FormData();
  formData.append("audio", file);
  formData.append("title", title);
  formData.append("artist", artist);

  const response = await axios.post("/songs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
```

### Streaming Audio

```javascript
const audioElement = new Audio();
audioElement.src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/stream/${songId}`;
audioElement.play();
```

---

## 📱 Frontend Integration Examples

### React Hook for Liked Songs

```javascript
const useLikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get("/likes/songs");
        setLikedSongs(response.data);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

  const toggleLike = async (songId) => {
    try {
      const isLiked = likedSongs.some((song) => song.id === songId);

      if (isLiked) {
        await axios.delete(`/likes/songs/${songId}`);
        setLikedSongs((prev) => prev.filter((song) => song.id !== songId));
      } else {
        await axios.post(`/likes/songs/${songId}`);
        // Refetch to get updated data
        const response = await axios.get("/likes/songs");
        setLikedSongs(response.data);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return { likedSongs, loading, toggleLike };
};
```

### Playlist Management Hook

```javascript
const usePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);

  const createPlaylist = async (name, description, isPublic = false) => {
    const response = await axios.post("/playlists", {
      name,
      description,
      isPublic,
    });

    setPlaylists((prev) => [...prev, response.data]);
    return response.data;
  };

  const addSongToPlaylist = async (playlistId, songId) => {
    await axios.post(`/playlists/${playlistId}/songs`, { songId });
    // Refresh playlist data
    fetchPlaylists();
  };

  return { playlists, createPlaylist, addSongToPlaylist };
};
```

---

_Last updated: July 22, 2025_
_API Version: 2.0.0_
_For support, contact the development team_
