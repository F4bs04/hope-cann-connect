-- Add file attachment support to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT;

-- Create index for better performance on file queries
CREATE INDEX idx_chat_messages_file_url ON public.chat_messages(file_url) WHERE file_url IS NOT NULL;