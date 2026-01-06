/**
 * Task service instance for the dashboard
 * Properly configured with Vite environment variables
 */

console.log('🔵 taskService.ts is loading...');
alert('TaskService module is loading!');

import { TaskService } from '../../../services/task.service';

// Hardcoded values temporarily - TODO: Fix .env loading
const supabaseUrl = 'https://vsyhhgkfjwkjubvsdqjw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWhoZ2tmandranVidnNkcWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQxODksImV4cCI6MjA4MjU3MDE4OX0.TaC7S0Xi7Vj8cgp7IKuRk4VyhNkf8Vyqdt_-uzd9uqo';

// Debug logging
console.log('=== TaskService Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 20) + '...');

// Create and export a singleton instance
export const taskService = new TaskService(supabaseUrl, supabaseAnonKey);
