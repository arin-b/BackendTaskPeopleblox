# Backend Task for Internship Position

**Things to Know:**
1. I am using Prisma Postgres (the online cloud-based database)
2. This is the Database Schema:

model user {
  id       Int     @id @default(autoincrement())
  username String  @unique
  password String
  failedAttempts DateTime[]
  isLocked Boolean @default(false)
  lockedTimestamp DateTime @default(now())
}
here:

id, username, password: self-explanatory

failedAttempts: It is an array of type DateTime. It will store the timestamp every time the user makes an unsuccessful login attempt, up to 5 times.

isLocked: A boolean value which tells us whether their account has been locked due to multiple failed attempts or not.

lockedTimestamp: It is the timestamp of the instance when user makes 5th unsuccessful attempt within 12 hours. We will use this to determine if more than 24hrs have passed since locking. The default is set to current time when user is created. 

