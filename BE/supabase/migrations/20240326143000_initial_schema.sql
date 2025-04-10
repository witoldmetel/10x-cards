-- Migration: Initial Schema Creation
-- Description: Creates users and flashcards tables with RLS policies and indexes
-- Author: System
-- Date: 2024-03-26

-- Enable pgcrypto extension for generating api keys
create extension if not exists "pgcrypto";

-- Create auth schema if it doesn't exist (required for Supabase Auth)
create schema if not exists auth;

-- Create users table
create table users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    api_key text not null default encode(gen_random_bytes(32), 'hex'),
    created_at timestamp with time zone default current_timestamp
);

-- Enable RLS on users table
alter table users enable row level security;

-- Create RLS policies for users table
create policy "Users can view their own data" on users
    for select using (auth.uid() = id);

create policy "Users can update their own data" on users
    for update using (auth.uid() = id);

-- Create flashcards table with partitioning
create table flashcards (
    id serial,
    user_id uuid not null references users(id) on delete cascade,
    question text not null,
    answer text not null,
    review_status text not null check (review_status in ('New', 'To correct', 'Approved', 'Rejected')),
    archived_at timestamp with time zone,
    archived boolean default false,
    tags text[],
    categories text[],
    sm2_repetitions integer default 0,
    sm2_interval integer default 0,
    sm2_efactor numeric default 2.5,
    sm2_due_date timestamp with time zone,
    created_at timestamp with time zone default current_timestamp,
    primary key (id, created_at)
) partition by range (created_at);

-- Create default partition
create table flashcards_default partition of flashcards default;

-- Enable RLS on flashcards table
alter table flashcards enable row level security;

-- Create RLS policies for flashcards table
create policy "Users can view their own flashcards" on flashcards
    for select using (auth.uid() = user_id);

create policy "Users can create their own flashcards" on flashcards
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own flashcards" on flashcards
    for update using (auth.uid() = user_id);

create policy "Users can delete their own flashcards" on flashcards
    for delete using (auth.uid() = user_id);

-- Create indexes
create index idx_flashcards_user_id on flashcards (user_id);
create index idx_flashcards_created_at on flashcards (created_at);
create index idx_flashcards_review_status on flashcards (review_status);
create index idx_flashcards_archived on flashcards (archived); 