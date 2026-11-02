-- ME Academy has its own course categories (Admin > Courses > Categories), so the starter list of 12 generic names
-- must not be enforced on courses.category.
alter table public.courses drop constraint if exists courses_category_check;
