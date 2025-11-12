-- Email Reminders Table
-- Tracks sent reminder emails to prevent duplicates and enable audit trail

CREATE TABLE email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('24h', '30m')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  email_to TEXT NOT NULL,
  email_status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (email_status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_reminders_booking_id ON email_reminders(booking_id);
CREATE INDEX idx_email_reminders_sent_at ON email_reminders(sent_at);
CREATE INDEX idx_email_reminders_type ON email_reminders(reminder_type);
CREATE UNIQUE INDEX idx_email_reminders_unique ON email_reminders(booking_id, reminder_type);

-- Add reminder preferences to bookings table
ALTER TABLE bookings
ADD COLUMN reminder_24h_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN reminder_30m_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Comments
COMMENT ON TABLE email_reminders IS 'リマインドメール送信履歴';
COMMENT ON COLUMN email_reminders.reminder_type IS 'リマインド種別: 24h=24時間前, 30m=30分前';
COMMENT ON COLUMN email_reminders.email_status IS 'メール送信ステータス';
COMMENT ON COLUMN bookings.reminder_24h_enabled IS '24時間前リマインド有効フラグ';
COMMENT ON COLUMN bookings.reminder_30m_enabled IS '30分前リマインド有効フラグ';
