-- My textbook's 5 lessons, from the "Vocab Bank" sheet of Korean_Vocab_Bank.xlsx.
-- Run in Supabase → SQL Editor after replacing the email below with your account's email.

insert into public.lessons (user_id, number, topic_korean, topic_english)
select users.id, l.number, l.topic_korean, l.topic_english
from public.users
cross join (values
  (1, '인사',      'Greetings'),
  (2, '학교생활',  'School life'),
  (3, '캠퍼스',    'Campus'),
  (4, '가족과 집', 'Family & home'),
  (5, '서점에서',  'At the bookstore')
) as l (number, topic_korean, topic_english)
where users.email = 'you@example.com'
on conflict (user_id, number) do nothing;
