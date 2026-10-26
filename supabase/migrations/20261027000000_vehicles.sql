-- All vehicles, not just cars: bikes, scooters and autos sit alongside the car sizes.
-- The table keeps its name (car_types); the app calls these "vehicles".

-- Which group a vehicle is picked from on the "Your vehicle" screen.
alter table public.car_types
  add column category text not null default 'car' check (category in ('bike', 'auto', 'car')),
  -- Average minutes to wash one, for the live queue's wait estimate.
  add column wash_minutes int not null default 7 check (wash_minutes > 0);

-- The wait estimate now comes from each vehicle in the queue.
alter table public.stations drop column minutes_per_car;

-- Optional per-vehicle wording for a package ("Wash, chain clean and polish" for bikes).
alter table public.package_prices add column includes text;

-- Which vehicle groups an add-on is offered for.
alter table public.addons
  add column categories text[] not null default '{bike,auto,car}'
  check (categories <@ array['bike', 'auto', 'car']);
