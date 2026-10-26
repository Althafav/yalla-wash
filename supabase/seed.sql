-- Yalla Wash sample data. Safe to re-run: it clears bookings and customers first.
-- Edit the station row to your real station's name, area, city and location.

delete from public.ratings;
delete from public.booking_addons;
delete from public.bookings;
delete from public.cars;
delete from public.customers;
delete from public.package_prices;
delete from public.addons;
delete from public.packages;
delete from public.car_types;
delete from public.stations;

insert into public.stations (id, name, area, city, open_until, lat, lng)
values ('00000000-0000-4000-8000-000000000001', 'Yalla Wash Station 1', 'Main Road', 'Kochi', '11 pm', 9.9816, 76.2999);

-- Vehicles, grouped into bike / auto / car. wash_minutes drives the live queue's wait estimate.
-- Bike, scooter and auto prices are placeholders: change them to your real prices.
insert into public.car_types (id, name, note, category, wash_minutes, sort) values
  ('bike', 'Bike', 'Motorcycles', 'bike', 4, 1),
  ('scooter', 'Scooter', 'Scooters and mopeds', 'bike', 4, 2),
  ('auto', 'Auto', 'Auto-rickshaws', 'auto', 6, 3),
  ('sedan', 'Sedan', 'Most cars', 'car', 7, 4),
  ('suv', 'SUV', '4x4 and crossovers', 'car', 9, 5),
  ('van', 'Van', '7-seaters, minivans', 'car', 10, 6),
  ('pickup', 'Pickup', 'Single or double cab', 'car', 9, 7);

insert into public.packages (id, name, includes, popular, sort) values
  ('express', 'Express', 'Exterior wash and hand dry', false, 1),
  ('full', 'Full wash', 'Exterior, interior vacuum, dashboard and windows', true, 2),
  ('premium', 'Premium', 'Full wash plus wax, tyre shine and seat clean', false, 3);

-- A missing row means that package isn't offered for that vehicle.
-- `includes` overrides the package description for that vehicle.
insert into public.package_prices (package_id, car_type_id, price, includes) values
  ('express', 'bike', 79, 'Foam wash and dry'),
  ('full', 'bike', 129, 'Foam wash, chain clean and lube, dry'),
  ('premium', 'bike', 249, 'Full wash plus polish and tyre shine'),
  ('express', 'scooter', 79, 'Foam wash and dry'),
  ('full', 'scooter', 129, 'Foam wash, under-seat clean, dry'),
  ('premium', 'scooter', 249, 'Full wash plus polish and tyre shine'),
  ('express', 'auto', 149, 'Exterior wash and dry'),
  ('full', 'auto', 249, 'Exterior, seats, floor and canopy clean'),
  ('express', 'sedan', 249, null), ('full', 'sedan', 399, null), ('premium', 'sedan', 699, null),
  ('express', 'suv', 299, null),   ('full', 'suv', 499, null),   ('premium', 'suv', 799, null),
  ('express', 'van', 349, null),   ('full', 'van', 599, null),   ('premium', 'van', 899, null),
  ('express', 'pickup', 349, null),('full', 'pickup', 549, null),('premium', 'pickup', 849, null);

insert into public.addons (id, name, price, categories, sort) values
  ('tyre', 'Tyre shine', 99, '{bike,auto,car}', 1),
  ('wax', 'Wax', 199, '{bike,auto,car}', 2),
  ('chain', 'Chain lube', 49, '{bike}', 3),
  ('perfume', 'Perfume', 49, '{auto,car}', 4),
  ('engine', 'Engine bay', 249, '{car}', 5);

-- Demo customer: sign in with 99999 99999 and code 1234. Five paid washes, so the next one is free.
insert into public.customers (id, phone, name) values
  ('00000000-0000-4000-8000-0000000000d0', '9999999999', 'Demo'),
  ('00000000-0000-4000-8000-0000000000a1', '9000000001', null),
  ('00000000-0000-4000-8000-0000000000a2', '9000000002', null),
  ('00000000-0000-4000-8000-0000000000a3', '9000000003', null),
  ('00000000-0000-4000-8000-0000000000a4', '9000000004', null),
  ('00000000-0000-4000-8000-0000000000a5', '9000000005', null);

insert into public.cars (customer_id, car_type_id, state_code, plate) values
  ('00000000-0000-4000-8000-0000000000d0', 'suv', 'KL', '07 AB 1234');

-- Past washes for the demo customer, one a week.
insert into public.bookings
  (code, customer_id, station_id, car_type_id, state_code, plate, package_id, mode, slot_at, status,
   package_price, addons_total, total, checked_in_at, status_at, created_at)
select
  'YW-DEMO-' || n,
  '00000000-0000-4000-8000-0000000000d0',
  '00000000-0000-4000-8000-000000000001',
  'suv', 'KL', '07 AB 1234',
  case when n % 2 = 0 then 'full' else 'express' end,
  'slot',
  (((now() at time zone 'Asia/Kolkata')::date - n * 7) + time '17:30') at time zone 'Asia/Kolkata',
  'done',
  case when n % 2 = 0 then 499 else 299 end,
  case when n % 2 = 0 then 99 else 0 end,
  case when n % 2 = 0 then 598 else 299 end,
  now() - (n * 7) * interval '1 day',
  now() - (n * 7) * interval '1 day',
  now() - (n * 7 + 1) * interval '1 day'
from generate_series(1, 5) as n;

insert into public.booking_addons (booking_id, addon_id, price)
select id, 'tyre', 99 from public.bookings where code in ('YW-DEMO-2', 'YW-DEMO-4');

insert into public.ratings (booking_id, stars, tags)
select id, 5, '{Spotless,Quick}' from public.bookings where code = 'YW-DEMO-1';

-- Today's live queue: 3 cars at the station right now.
insert into public.bookings
  (code, customer_id, station_id, car_type_id, package_id, mode, status,
   package_price, total, checked_in_at, status_at, created_at)
values
  ('YW-SEED-Q1', '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001',
   'sedan', 'full', 'queue', 'washing', 399, 399, now() - interval '12 minutes', now() - interval '6 minutes', now() - interval '15 minutes'),
  ('YW-SEED-Q2', '00000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-000000000001',
   'bike', 'express', 'queue', 'checked_in', 79, 79, now() - interval '5 minutes', now() - interval '5 minutes', now() - interval '9 minutes'),
  ('YW-SEED-Q3', '00000000-0000-4000-8000-0000000000a3', '00000000-0000-4000-8000-000000000001',
   'van', 'premium', 'queue', 'queued', 899, 899, null, now() - interval '3 minutes', now() - interval '3 minutes');

-- Tomorrow 5:00 pm is fully booked (capacity 2) so the time screen shows a greyed-out slot.
insert into public.bookings
  (code, customer_id, station_id, car_type_id, package_id, mode, slot_at, status, package_price, total)
values
  ('YW-SEED-S1', '00000000-0000-4000-8000-0000000000a4', '00000000-0000-4000-8000-000000000001', 'sedan', 'full', 'slot',
   (((now() at time zone 'Asia/Kolkata')::date + 1) + time '17:00') at time zone 'Asia/Kolkata', 'booked', 399, 399),
  ('YW-SEED-S2', '00000000-0000-4000-8000-0000000000a5', '00000000-0000-4000-8000-000000000001', 'suv', 'full', 'slot',
   (((now() at time zone 'Asia/Kolkata')::date + 1) + time '17:00') at time zone 'Asia/Kolkata', 'booked', 499, 499),
  ('YW-SEED-S3', '00000000-0000-4000-8000-0000000000a4', '00000000-0000-4000-8000-000000000001', 'sedan', 'express', 'slot',
   (((now() at time zone 'Asia/Kolkata')::date + 2) + time '19:30') at time zone 'Asia/Kolkata', 'booked', 249, 249),
  ('YW-SEED-S4', '00000000-0000-4000-8000-0000000000a5', '00000000-0000-4000-8000-000000000001', 'suv', 'premium', 'slot',
   (((now() at time zone 'Asia/Kolkata')::date + 2) + time '19:30') at time zone 'Asia/Kolkata', 'booked', 799, 799);
