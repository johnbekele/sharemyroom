// services/googleBooksService.js
import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import logger from '../../utils/logger.js';

dotenv.config();

// Cache with 1-day TTL (time to live)
const bookCache = new NodeCache({ stdTTL: 86400 });

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Search books by query
export const searchBooks = async (query, limit = 5) => {
  try {
    const cacheKey = `search:${query}:${limit}`;
    const cachedResults = bookCache.get(cacheKey);

    if (cachedResults) {
      logger.info('Returning cached search results for:', query);
      return cachedResults;
    }

    // Make API request if not in cache
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults: limit,
        key: GOOGLE_BOOKS_API_KEY,
      },
    });

    if (!response.data.items) {
      return [];
    }

    // Transform data to only what we need
    const books = response.data.items.map((item) => ({
      googleId: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors
        ? item.volumeInfo.authors.join(', ')
        : 'Unknown',
      description: item.volumeInfo.description || '',
      coverImage: item.volumeInfo.imageLinks?.thumbnail || null,
      pageCount: item.volumeInfo.pageCount || 0,
      categories: item.volumeInfo.categories || [],
      publishedDate: item.volumeInfo.publishedDate || '',
    }));

    // Store in cache
    bookCache.set(cacheKey, books);

    return books;
  } catch (error) {
    logger.error('Error searching Google Books API:', error);
    throw new Error('Failed to search books');
  }
};

// Get single book by ID
export const getBookById = async (googleId) => {
  try {
    // Check cache first
    const cacheKey = `book:${googleId}`;
    const cachedBook = bookCache.get(cacheKey);

    if (cachedBook) {
      logger.info('Returning cached book data for:', googleId);
      return cachedBook;
    }

    // Make API request if not in cache
    const response = await axios.get(`${GOOGLE_BOOKS_API_URL}/${googleId}`, {
      params: {
        key: GOOGLE_BOOKS_API_KEY,
      },
    });

    const volumeInfo = response.data.volumeInfo;

    // Transform to only what we need
    const book = {
      googleId: response.data.id,
      title: volumeInfo.title,
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown',
      description: volumeInfo.description || '',
      coverImage: volumeInfo.imageLinks?.thumbnail || null,
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      publishedDate: volumeInfo.publishedDate || '',
    };

    // Store in cache
    bookCache.set(cacheKey, book);

    return book;
  } catch (error) {
    logger.error('Error fetching book from Google Books API:', error);
    throw new Error('Failed to fetch book details');
  }
};

export default { searchBooks, getBookById };
