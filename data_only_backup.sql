--
-- PostgreSQL database dump
--

\restrict MbfEIiYAkLBxj6EyMjQ2a3kCkSw3SFjaydhPJ3bphmwVZPboiYyehHRnCPikBPO

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.products VALUES (5, 'Garapiñados Keto', 'Garapiñados Keto presentación 100 g', 'Snacks', 70.00, 35.00, 'g', 2.000, true, '2025-09-30 16:29:00.274-06', '2025-09-30 16:30:20.829-06');
INSERT INTO public.products VALUES (1, 'Healthynola 1/2 kg', 'Granola Regular presentación 1/2 kg', 'Granola', 140.00, 60.00, 'kg', 10.000, true, '2025-09-28 22:04:17.926345-06', '2025-09-29 19:09:20.061-06');
INSERT INTO public.products VALUES (3, 'Healthynola 1 kg', 'Granola Regular presentación 1 kg', 'Granola', 250.00, 125.00, 'kg', 10.000, true, '2025-09-29 17:40:30.932-06', '2025-09-29 19:10:02.927-06');
INSERT INTO public.products VALUES (4, 'Healthynola Keto 1/2 kg', 'Granola Keto presentación 1/2 kg', 'Granola', 200.00, 100.00, 'kg', 2.000, true, '2025-09-30 16:27:46.494-06', '2025-09-30 16:28:01.073-06');
INSERT INTO public.products VALUES (6, 'Kombucha Natural', 'Kombucha presentación 355 ml', 'Kombucha ', 55.00, 10.00, 'ml', 10.000, true, '2025-10-02 00:06:33.193-06', '2025-10-02 00:09:43.078-06');


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.recipes VALUES (1, 'Healthynola ', 'Granola Regular', 3, 25.00, 'kg', NULL, true, '2025-09-29 16:54:41.671-06', '2025-09-29 16:54:41.671-06');
INSERT INTO public.recipes VALUES (2, 'Kombucha Natural', 'Kombucha Natural', 6, 3.00, 'litros', NULL, true, '2025-10-01 18:10:07.42-06', '2025-10-01 18:10:07.42-06');
INSERT INTO public.recipes VALUES (3, 'Garapiñados Keto', 'Garapiñados Keto', 5, 1.00, 'kg', NULL, true, '2025-10-01 19:38:38.428-06', '2025-10-01 19:38:38.428-06');


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.batches VALUES (1, 'LOTE-20250930-413', 1, '2025-09-30', 25.00, 'kg', 670.00, 'completado', NULL, '2025-09-29 17:04:02.875-06', '2025-09-29 17:06:18.163-06');
INSERT INTO public.batches VALUES (2, 'LOTE-20250930-103', 1, '2025-09-30', 25.00, 'kg', 670.00, 'completado', NULL, '2025-09-29 17:16:18.667-06', '2025-09-30 10:37:54.575-06');
INSERT INTO public.batches VALUES (3, 'LOTE-KBN-20251002-050', 2, '2025-10-02', 3.00, 'litros', 38.00, 'completado', NULL, '2025-10-01 18:11:18.026-06', '2025-10-01 19:16:26.666-06');
INSERT INTO public.batches VALUES (4, 'LOTE-KBN-20251002-228', 2, '2025-10-02', 3.00, 'litros', 38.00, 'completado', NULL, '2025-10-01 19:27:10.159-06', '2025-10-01 19:27:29.326-06');
INSERT INTO public.batches VALUES (5, 'LOTE-GPK-20251002-969', 3, '2025-10-02', 1.00, 'kg', 375.00, 'completado', NULL, '2025-10-01 19:40:54.605-06', '2025-10-01 19:45:48.954-06');


--
-- Data for Name: batch_packaging; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.batch_packaging VALUES (1, 1, 3, 10, 'Principal', '2025-09-29 17:06:18.163-06', '1kg');
INSERT INTO public.batch_packaging VALUES (2, 1, 1, 20, 'Principal', '2025-09-29 17:06:18.163-06', '0.5kg');
INSERT INTO public.batch_packaging VALUES (3, 1, 3, 5, 'Principal', '2025-09-29 17:06:18.163-06', '1kg');
INSERT INTO public.batch_packaging VALUES (4, 2, 3, 15, 'Principal', '2025-09-30 10:37:54.575-06', '1kg');
INSERT INTO public.batch_packaging VALUES (5, 2, 1, 20, 'Principal', '2025-09-30 10:37:54.575-06', '0.5kg');
INSERT INTO public.batch_packaging VALUES (14, 3, 4, 8, 'Principal', '2025-10-01 19:16:26.666-06', 'LK-355');
INSERT INTO public.batch_packaging VALUES (15, 4, 6, 8, 'Principal', '2025-10-01 19:27:29.326-06', 'LK-355');
INSERT INTO public.batch_packaging VALUES (16, 5, 5, 10, 'Principal', '2025-10-01 19:45:48.954-06', 'BG-100');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.categories VALUES (1, 'Granola', 'Productos de granola artesanal', '#673ab7', true, '2025-10-01 22:45:39.175478-06', '2025-10-01 23:49:50.119-06');
INSERT INTO public.categories VALUES (2, 'Snacks', 'Snacks saludables y frutos secos', '#607d8b', true, '2025-10-01 22:45:39.175478-06', '2025-10-01 23:49:57.852-06');
INSERT INTO public.categories VALUES (5, 'Kombucha ', 'Bebidas Artesanales', '#e91e63', true, '2025-10-02 00:04:14.916794-06', '2025-10-02 00:04:14.916794-06');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.customers VALUES (2, 'andres miguelez', 'andres@email.com', '2213494926', 'Prol. de la 15 sur 2307 Casa 11 A C.P. 72764', 'Regular', 'El mas guapo de Cholula centro', true, '2025-09-29 16:30:56.973-06', '2025-09-30 16:31:39.087-06');
INSERT INTO public.customers VALUES (3, 'Sergio', 'sergio@mail.com', '3333892666', NULL, 'Consignación', 'Santa Maria del Pueblito', true, '2025-09-30 16:33:26.501-06', '2025-09-30 16:33:39.9-06');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.users VALUES (2, 'Gerente', 'manager@healthynola.com', '$2a$10$GjoYSCUxtOJPlEUTIpgrvOz1jRU158Xymb.wUd/dg6z912.kfRn2q', 'manager', true, '2025-09-30 19:07:31.492-06', '2025-09-28 22:04:17.914407-06', '2025-09-28 22:04:17.914407-06');
INSERT INTO public.users VALUES (3, 'Cajero Demo', 'cashier@healthynola.com', '$2a$10$V5xA9VVXNViLMoCgBKofCu8cEM0aT7b9tRT3kkhBop5aQeOfmUreS', 'cashier', true, '2025-10-02 03:43:18.052-06', '2025-09-28 22:04:17.914407-06', '2025-09-28 22:04:17.914407-06');
INSERT INTO public.users VALUES (1, 'Administrador', 'admin@healthynola.com', '$2a$10$a9BdaLaUgFuKEapvf1vje.Td5ipWGWwGHFCP7QFibGmYT5gTXbjiG', 'admin', true, '2025-10-02 22:23:45.28-06', '2025-09-28 22:04:17.914407-06', '2025-09-28 22:04:17.914407-06');


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.expenses VALUES (1, 1, 'Tanque de Gasolina', 'Gasolina', 1230.00, 'Tarjeta', 'MMM', '2025-09-29', NULL, '2025-09-29 15:59:23.168-06', '2025-09-29 15:59:23.168-06', '/uploads/receipts/receipt-1759204763158-57576.png');
INSERT INTO public.expenses VALUES (2, 1, 'aceite de coco', 'Materia Prima', 870.00, 'Efectivo', 'Dana', '2025-09-29', NULL, '2025-09-29 16:00:08.519-06', '2025-09-29 16:00:08.519-06', '/uploads/receipts/receipt-1759204808517-235000166.JPG');
INSERT INTO public.expenses VALUES (3, 1, 'servilletas', 'Otros', 100.00, 'Efectivo', 'MMM', '2025-09-29', 'Compre servilletas en el oxxo', '2025-09-30 10:51:19.762-06', '2025-09-30 10:51:36.935-06', '/uploads/receipts/receipt-1759272679754-643813830.png');


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.inventory VALUES (18, 6, 2.000, '2025-10-02 03:19:45.082-06', '2025-10-02 22:24:29.667-06', 'MdMM', 0.000, 100.000);
INSERT INTO public.inventory VALUES (14, 3, 4.000, '2025-09-29 18:53:23.611-06', '2025-10-02 02:11:09.338-06', 'MMM', 2.000, 5.000);
INSERT INTO public.inventory VALUES (2, 1, 24.000, '2025-09-28 22:04:17.946744-06', '2025-10-02 02:11:16.255-06', 'MMM', 2.000, 5.000);
INSERT INTO public.inventory VALUES (3, 1, 14.000, '2025-09-28 22:04:17.946744-06', '2025-10-02 02:22:14.143-06', 'DVP', 2.000, 5.000);
INSERT INTO public.inventory VALUES (17, 5, 5.000, '2025-10-01 19:45:48.954-06', '2025-10-02 02:11:38.111-06', 'AP', 2.000, 5.000);
INSERT INTO public.inventory VALUES (1, 1, 49.000, '2025-09-28 22:04:17.946744-06', '2025-10-02 02:12:43.03-06', 'AP', 2.000, 5.000);
INSERT INTO public.inventory VALUES (15, 4, 8.000, '2025-10-01 19:16:26.666-06', '2025-10-02 02:12:49.876-06', 'AP', 2.000, 5.000);
INSERT INTO public.inventory VALUES (19, 6, 1.000, '2025-10-02 03:22:28.644-06', '2025-10-02 03:22:28.644-06', 'MMM', 0.000, 100.000);
INSERT INTO public.inventory VALUES (16, 6, 0.000, '2025-10-01 19:27:29.326-06', '2025-10-02 03:22:53.53-06', 'AP', 2.000, 5.000);
INSERT INTO public.inventory VALUES (20, 3, 0.000, '2025-10-02 03:26:33.738-06', '2025-10-02 03:37:39.696-06', 'AME', 0.000, 100.000);
INSERT INTO public.inventory VALUES (13, 3, 21.000, '2025-09-29 18:52:14.085-06', '2025-10-02 03:37:39.699-06', 'AP', 2.000, 5.000);


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.inventory_movements VALUES (2, 1, 1, 'MMM', 'venta', 20.000, 1.000, 19.000, 'Venta a andres', NULL, NULL, '2025-09-29 17:17:13.926-06', '2025-09-29 17:17:13.926-06');
INSERT INTO public.inventory_movements VALUES (4, 1, 1, 'DVP', 'venta', 15.000, 10.000, 5.000, 'Venta a andres', NULL, NULL, '2025-09-29 17:19:32.024-06', '2025-09-29 17:19:32.024-06');
INSERT INTO public.inventory_movements VALUES (6, 1, 1, 'DVP', 'ajuste', 5.000, 5.000, 10.000, 'Actualización manual de stock', NULL, NULL, '2025-09-29 17:36:19.093-06', '2025-09-29 17:36:19.093-06');
INSERT INTO public.inventory_movements VALUES (7, 1, 1, 'DVP', 'ajuste', 10.000, 2.000, 12.000, 'Actualización manual de stock', NULL, NULL, '2025-09-29 17:36:32.097-06', '2025-09-29 17:36:32.097-06');
INSERT INTO public.inventory_movements VALUES (12, 1, 1, 'DVP', 'transferencia', 12.000, 2.000, 12.000, 'Transferencia desde Principal', 3, 'transfer', '2025-09-29 18:57:19.593-06', '2025-09-29 18:57:19.593-06');
INSERT INTO public.inventory_movements VALUES (15, 1, 1, 'MMM', 'venta', 29.000, 5.000, 24.000, 'Venta a andres', NULL, NULL, '2025-09-29 19:52:39.882-06', '2025-09-29 19:52:39.882-06');
INSERT INTO public.inventory_movements VALUES (16, 3, 1, 'MMM', 'venta', 5.000, 1.000, 4.000, 'Venta a andres', NULL, NULL, '2025-09-29 20:04:03.762-06', '2025-09-29 20:04:03.762-06');
INSERT INTO public.inventory_movements VALUES (17, 3, 1, 'MMM', 'venta', 4.000, 1.000, 3.000, 'Venta a andres', NULL, NULL, '2025-09-29 21:29:39.327-06', '2025-09-29 21:29:39.327-06');
INSERT INTO public.inventory_movements VALUES (18, 3, 1, 'MMM', 'venta', 3.000, 3.000, 0.000, 'Venta a andres', NULL, NULL, '2025-09-29 21:30:20.099-06', '2025-09-29 21:30:20.099-06');
INSERT INTO public.inventory_movements VALUES (25, 3, 1, 'MMM', 'transferencia', 0.000, 10.000, 0.000, 'Transferencia desde Principal', 4, 'transfer', '2025-09-30 16:40:26.08-06', '2025-09-30 16:40:26.08-06');
INSERT INTO public.inventory_movements VALUES (26, 3, 1, 'MMM', 'venta', 10.000, 5.000, 5.000, 'Venta a andres miguelez', NULL, NULL, '2025-09-30 16:53:48.162-06', '2025-09-30 16:53:48.162-06');
INSERT INTO public.inventory_movements VALUES (31, 3, 1, 'MMM', 'venta', 5.000, 1.000, 4.000, 'Venta a andres miguelez', NULL, NULL, '2025-10-02 01:37:28.896-06', '2025-10-02 01:37:28.896-06');
INSERT INTO public.inventory_movements VALUES (1, 1, 1, 'AP', 'venta', 45.000, 5.000, 40.000, 'Venta a andres', NULL, NULL, '2025-09-29 16:59:13.303-06', '2025-09-29 16:59:13.303-06');
INSERT INTO public.inventory_movements VALUES (3, 1, 1, 'AP', 'venta', 40.000, 10.000, 30.000, 'Venta a andres', NULL, NULL, '2025-09-29 17:17:51.174-06', '2025-09-29 17:17:51.174-06');
INSERT INTO public.inventory_movements VALUES (5, 1, 1, 'AP', 'venta', 30.000, 9.000, 21.000, 'Venta a andres', NULL, NULL, '2025-09-29 17:31:51.552-06', '2025-09-29 17:31:51.552-06');
INSERT INTO public.inventory_movements VALUES (9, 3, 1, 'AP', 'ajuste', 0.000, 10.000, 10.000, 'Creación de item de inventario', NULL, NULL, '2025-09-29 18:52:14.088-06', '2025-09-29 18:52:14.088-06');
INSERT INTO public.inventory_movements VALUES (11, 1, 1, 'AP', 'transferencia', 11.000, -2.000, 9.000, 'Transferencia a DVP', 3, 'transfer', '2025-09-29 18:57:19.593-06', '2025-09-29 18:57:19.593-06');
INSERT INTO public.inventory_movements VALUES (13, 3, 1, 'AP', 'venta', 5.000, 1.000, 4.000, 'Venta a andres', NULL, NULL, '2025-09-29 19:40:06.322-06', '2025-09-29 19:40:06.322-06');
INSERT INTO public.inventory_movements VALUES (14, 3, 1, 'AP', 'venta', 4.000, 3.000, 1.000, 'Venta a andres', NULL, NULL, '2025-09-29 19:47:40.65-06', '2025-09-29 19:47:40.65-06');
INSERT INTO public.inventory_movements VALUES (19, 3, 1, 'AP', 'produccion', 1.000, 10.000, 11.000, 'Producción de lote LOTE-20250930-413', 1, 'batch', '2025-09-29 17:06:18.163-06', '2025-09-29 17:06:18.163-06');
INSERT INTO public.inventory_movements VALUES (20, 1, 1, 'AP', 'produccion', 9.000, 20.000, 29.000, 'Producción de lote LOTE-20250930-413', 1, 'batch', '2025-09-29 17:06:18.163-06', '2025-09-29 17:06:18.163-06');
INSERT INTO public.inventory_movements VALUES (21, 3, 1, 'AP', 'produccion', 11.000, 5.000, 16.000, 'Producción de lote LOTE-20250930-413', 1, 'batch', '2025-09-29 17:06:18.163-06', '2025-09-29 17:06:18.163-06');
INSERT INTO public.inventory_movements VALUES (22, 3, 1, 'AP', 'produccion', 16.000, 15.000, 31.000, 'Producción de lote LOTE-20250930-103', 2, 'batch', '2025-09-30 10:37:54.575-06', '2025-09-30 10:37:54.575-06');
INSERT INTO public.inventory_movements VALUES (23, 1, 1, 'AP', 'produccion', 29.000, 20.000, 49.000, 'Producción de lote LOTE-20250930-103', 2, 'batch', '2025-09-30 10:37:54.575-06', '2025-09-30 10:37:54.575-06');
INSERT INTO public.inventory_movements VALUES (24, 3, 1, 'AP', 'transferencia', 31.000, -10.000, 21.000, 'Transferencia a MMM', 4, 'transfer', '2025-09-30 16:40:26.08-06', '2025-09-30 16:40:26.08-06');
INSERT INTO public.inventory_movements VALUES (27, 4, 1, 'AP', 'produccion', 0.000, 8.000, 8.000, 'Producción de lote LOTE-KBN-20251002-050', 3, 'batch', '2025-10-01 19:16:26.666-06', '2025-10-01 19:16:26.666-06');
INSERT INTO public.inventory_movements VALUES (28, 6, 1, 'AP', 'produccion', 0.000, 8.000, 8.000, 'Producción de lote LOTE-KBN-20251002-228', 4, 'batch', '2025-10-01 19:27:29.326-06', '2025-10-01 19:27:29.326-06');
INSERT INTO public.inventory_movements VALUES (29, 6, 1, 'AP', 'venta', 8.000, 1.000, 7.000, 'Venta a andres miguelez', NULL, NULL, '2025-10-02 01:29:21.677-06', '2025-10-02 01:29:21.677-06');
INSERT INTO public.inventory_movements VALUES (30, 6, 1, 'AP', 'venta', 7.000, 2.000, 5.000, 'Venta a andres miguelez', NULL, NULL, '2025-10-02 01:29:52.597-06', '2025-10-02 01:29:52.597-06');
INSERT INTO public.inventory_movements VALUES (32, 5, 1, 'AP', 'produccion', 0.000, 10.000, 10.000, 'Producción de lote LOTE-GPK-20251002-969', 5, 'batch', '2025-10-01 19:45:48.954-06', '2025-10-01 19:45:48.954-06');
INSERT INTO public.inventory_movements VALUES (33, 5, 1, 'AP', 'venta', 10.000, 5.000, 5.000, 'Venta a andres miguelez', NULL, NULL, '2025-10-02 01:46:50.673-06', '2025-10-02 01:46:50.673-06');
INSERT INTO public.inventory_movements VALUES (35, 6, 1, 'AP', 'transferencia', 2.000, -1.000, 1.000, 'Transferencia a MMM', 8, 'transfer', '2025-10-02 03:22:28.646-06', '2025-10-02 03:22:28.646-06');
INSERT INTO public.inventory_movements VALUES (36, 6, 1, 'MMM', 'transferencia', 0.000, 1.000, 1.000, 'Transferencia desde AP', 8, 'transfer', '2025-10-02 03:22:28.646-06', '2025-10-02 03:22:28.646-06');
INSERT INTO public.inventory_movements VALUES (37, 6, 1, 'AP', 'transferencia', 1.000, -1.000, 0.000, 'Transferencia a MdMM', 9, 'transfer', '2025-10-02 03:22:53.532-06', '2025-10-02 03:22:53.532-06');
INSERT INTO public.inventory_movements VALUES (38, 6, 1, 'MdMM', 'transferencia', 3.000, 1.000, 3.000, 'Transferencia desde AP', 9, 'transfer', '2025-10-02 03:22:53.532-06', '2025-10-02 03:22:53.532-06');
INSERT INTO public.inventory_movements VALUES (39, 3, 1, 'AP', 'transferencia', 21.000, -10.000, 11.000, 'Transferencia a AME', 10, 'transfer', '2025-10-02 03:26:33.739-06', '2025-10-02 03:26:33.739-06');
INSERT INTO public.inventory_movements VALUES (40, 3, 1, 'AME', 'transferencia', 0.000, 10.000, 10.000, 'Transferencia desde AP', 10, 'transfer', '2025-10-02 03:26:33.739-06', '2025-10-02 03:26:33.739-06');
INSERT INTO public.inventory_movements VALUES (41, 3, 1, 'AME', 'transferencia', 10.000, -10.000, 0.000, 'Transferencia a AP', 11, 'transfer', '2025-10-02 03:37:39.7-06', '2025-10-02 03:37:39.7-06');
INSERT INTO public.inventory_movements VALUES (42, 3, 1, 'AP', 'transferencia', 11.000, 10.000, 11.000, 'Transferencia desde AME', 11, 'transfer', '2025-10-02 03:37:39.7-06', '2025-10-02 03:37:39.7-06');
INSERT INTO public.inventory_movements VALUES (43, 6, 1, 'MdMM', 'venta', 4.000, 1.000, 3.000, 'Venta a andres miguelez', NULL, NULL, '2025-10-02 22:22:42.807-06', '2025-10-02 22:22:42.807-06');
INSERT INTO public.inventory_movements VALUES (44, 6, 1, 'MdMM', 'venta', 3.000, 1.000, 2.000, 'Venta a andres miguelez', NULL, NULL, '2025-10-02 22:24:29.669-06', '2025-10-02 22:24:29.669-06');


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.knex_migrations VALUES (1, '001_create_users.js', 1, '2025-09-28 22:04:09.287-06');
INSERT INTO public.knex_migrations VALUES (2, '002_create_customers.js', 1, '2025-09-28 22:04:09.354-06');
INSERT INTO public.knex_migrations VALUES (3, '003_create_products.js', 1, '2025-09-28 22:04:09.41-06');
INSERT INTO public.knex_migrations VALUES (4, '004_create_inventory.js', 1, '2025-09-28 22:04:09.439-06');
INSERT INTO public.knex_migrations VALUES (5, '005_create_sales.js', 1, '2025-09-28 22:04:09.477-06');
INSERT INTO public.knex_migrations VALUES (6, '006_create_inventory_movements.js', 1, '2025-09-28 22:04:09.51-06');
INSERT INTO public.knex_migrations VALUES (7, '007_create_transfers.js', 1, '2025-09-28 22:04:09.538-06');
INSERT INTO public.knex_migrations VALUES (8, '008_create_production_batches.js', 1, '2025-09-28 22:04:09.564-06');
INSERT INTO public.knex_migrations VALUES (9, '009_create_expenses.js', 1, '2025-09-28 22:04:09.58-06');
INSERT INTO public.knex_migrations VALUES (10, '010_create_system_logs.js', 1, '2025-09-28 22:04:09.598-06');
INSERT INTO public.knex_migrations VALUES (11, '011_add_receipt_path_to_expenses.js', 2, '2025-09-29 21:53:14.899-06');
INSERT INTO public.knex_migrations VALUES (12, '012_create_raw_materials.js', 3, '2025-09-29 22:26:09.728-06');
INSERT INTO public.knex_migrations VALUES (13, '013_create_recipes.js', 3, '2025-09-29 22:26:09.744-06');
INSERT INTO public.knex_migrations VALUES (14, '014_create_batches.js', 3, '2025-09-29 22:26:09.756-06');
INSERT INTO public.knex_migrations VALUES (15, '20251001014053_create_role_permissions_table.js', 4, '2025-10-02 00:16:00.008-06');
INSERT INTO public.knex_migrations VALUES (17, '20251002043701_create_categories_table.js', 5, '2025-10-02 00:16:11.921-06');
INSERT INTO public.knex_migrations VALUES (18, '20251001024035_add_salesperson_role.js', 6, '2025-10-02 00:16:17.071-06');
INSERT INTO public.knex_migrations VALUES (19, '20251002061523_create_packaging_types_table.js', 6, '2025-10-02 00:16:17.083-06');
INSERT INTO public.knex_migrations VALUES (20, '20251002063842_add_container_type_and_unit_to_packaging_types.js', 7, '2025-10-02 00:38:58.214-06');
INSERT INTO public.knex_migrations VALUES (21, '20251002065543_change_batch_packaging_tipo_bolsa_to_string.js', 8, '2025-10-02 00:56:15.338-06');
INSERT INTO public.knex_migrations VALUES (22, '20251002071500_add_tipo_empaque_to_sales.js', 9, '2025-10-02 01:21:18.694-06');
INSERT INTO public.knex_migrations VALUES (23, '20251002075000_create_warehouses_table.js', 10, '2025-10-02 01:48:31.625-06');
INSERT INTO public.knex_migrations VALUES (24, '20251002080000_add_stock_limits_and_dynamic_warehouse.js', 11, '2025-10-02 02:03:46.747-06');
INSERT INTO public.knex_migrations VALUES (25, '20250102090000_standardize_inventory_warehouse_codes.js', 12, '2025-10-02 02:40:23.193-06');
INSERT INTO public.knex_migrations VALUES (26, '20250102100000_update_transfers_warehouse_constraints.js', 13, '2025-10-02 03:16:46.412-06');
INSERT INTO public.knex_migrations VALUES (27, '20250102101000_update_inventory_movements_warehouse_constraints.js', 14, '2025-10-02 03:21:30.592-06');


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.knex_migrations_lock VALUES (1, 0);


--
-- Data for Name: packaging_types; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.packaging_types VALUES (1, 'BH-1', 'Bolsa presentación 1 kg', 1.000, true, '2025-10-02 00:16:22.969923-06', '2025-10-02 00:34:07.891924-06', 'bolsa', 'kg', 1.000);
INSERT INTO public.packaging_types VALUES (4, 'LK-355', 'Lata kombucha presentación 355 ml', 0.355, true, '2025-10-02 00:42:47.121899-06', '2025-10-02 01:11:22.430332-06', 'lata', 'mL', 355.000);
INSERT INTO public.packaging_types VALUES (3, 'BG-100', 'Bolsa presentación 100 g', 0.100, true, '2025-10-02 00:16:22.969923-06', '2025-10-02 01:44:37.726-06', 'bolsa', 'g', 100.000);
INSERT INTO public.packaging_types VALUES (2, 'BH-1/2', 'Bolsa presentación 1/2 kg', 0.500, true, '2025-10-02 00:16:22.969923-06', '2025-10-02 01:44:59.478-06', 'bolsa', 'kg', 0.500);


--
-- Data for Name: production_batches; Type: TABLE DATA; Schema: public; Owner: amiguelez
--



--
-- Data for Name: raw_materials; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.raw_materials VALUES (2, 'Aceite de Agave', 'Aceite de Agave', 'litros', 270.00, 'La sirenita', 1.00, 0.00, NULL, true, '2025-09-29 16:53:38.837-06', '2025-09-29 16:53:38.837-06');
INSERT INTO public.raw_materials VALUES (3, 'Nuez', 'Nuez de Peacan', 'kg', 780.00, 'Alejandro', 1.00, 0.00, 'Cotizar Nuez con otro proveedor para ver si mejoramos el precio 30/9/25', true, '2025-09-30 10:46:45.499-06', '2025-09-30 10:46:45.499-06');
INSERT INTO public.raw_materials VALUES (1, 'Coco', 'Coco rayado', 'kg', 400.00, 'Mercado de abasto', 1.00, 0.00, NULL, true, '2025-09-29 16:53:08.481-06', '2025-09-30 10:46:55.822-06');
INSERT INTO public.raw_materials VALUES (5, 'Azucar', 'Azucar morena', 'kg', 70.00, 'Mercado de Abasto', 0.50, 1.00, NULL, true, '2025-10-01 18:08:42.462-06', '2025-10-01 19:16:26.666-06');
INSERT INTO public.raw_materials VALUES (4, 'Agua', 'Agua purificada', 'litros', 3.00, 'Agua Purificada Zapopan', 1.00, 1.00, NULL, true, '2025-10-01 18:08:06.957-06', '2025-10-01 19:27:29.326-06');
INSERT INTO public.raw_materials VALUES (6, 'cacahuate', 'cacahuate', 'kg', 375.00, 'La ardilla', 1.00, 1.00, NULL, true, '2025-10-01 19:39:56.335-06', '2025-10-01 19:39:56.335-06');


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.recipe_ingredients VALUES (1, 1, 2, 1.000, 'kg', 270.00, '2025-09-29 16:55:00.274-06', '2025-09-29 16:55:00.274-06');
INSERT INTO public.recipe_ingredients VALUES (2, 1, 1, 1.000, 'kg', 400.00, '2025-09-29 16:55:11.527-06', '2025-09-29 16:55:11.527-06');
INSERT INTO public.recipe_ingredients VALUES (3, 1, 3, 2.000, 'kg', 1560.00, '2025-09-30 10:48:38.27-06', '2025-09-30 10:48:38.27-06');
INSERT INTO public.recipe_ingredients VALUES (4, 2, 4, 1.000, 'litros', 3.00, '2025-10-01 18:10:31.748-06', '2025-10-01 18:10:31.748-06');
INSERT INTO public.recipe_ingredients VALUES (5, 2, 5, 0.500, 'kg', 35.00, '2025-10-01 18:10:52.388-06', '2025-10-01 18:10:52.388-06');
INSERT INTO public.recipe_ingredients VALUES (6, 3, 6, 1.000, 'kg', 375.00, '2025-10-01 19:40:19.658-06', '2025-10-01 19:40:19.658-06');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.role_permissions VALUES (1, 'admin', 'dashboard', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (2, 'admin', 'sales', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (3, 'admin', 'customers', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (4, 'admin', 'transfers', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (5, 'admin', 'expenses', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (6, 'admin', 'reports', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (7, 'admin', 'inventory', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (8, 'admin', 'products', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (9, 'admin', 'production', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (10, 'admin', 'raw-materials', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (11, 'admin', 'recipes', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (12, 'admin', 'batches', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (13, 'admin', 'users', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (14, 'admin', 'settings', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (15, 'manager', 'dashboard', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (16, 'manager', 'sales', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (17, 'manager', 'customers', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (18, 'manager', 'transfers', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (19, 'manager', 'expenses', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (20, 'manager', 'reports', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (21, 'manager', 'inventory', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (22, 'manager', 'products', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (23, 'manager', 'production', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (24, 'manager', 'raw-materials', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (25, 'manager', 'recipes', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (26, 'manager', 'batches', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (32, 'salesperson', 'dashboard', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (33, 'salesperson', 'sales', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (34, 'salesperson', 'customers', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (35, 'salesperson', 'products', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (36, 'salesperson', 'inventory', true, '2025-10-01 22:45:39.187912-06', '2025-10-01 22:45:39.187912-06');
INSERT INTO public.role_permissions VALUES (37, 'cashier', 'customers', false, '2025-10-02 03:42:57.944-06', '2025-10-02 03:42:57.944-06');
INSERT INTO public.role_permissions VALUES (38, 'cashier', 'dashboard', true, '2025-10-02 03:42:57.944-06', '2025-10-02 03:42:57.944-06');
INSERT INTO public.role_permissions VALUES (39, 'cashier', 'inventory', false, '2025-10-02 03:42:57.944-06', '2025-10-02 03:42:57.944-06');
INSERT INTO public.role_permissions VALUES (40, 'cashier', 'products', false, '2025-10-02 03:42:57.944-06', '2025-10-02 03:42:57.944-06');
INSERT INTO public.role_permissions VALUES (41, 'cashier', 'sales', false, '2025-10-02 03:42:57.944-06', '2025-10-02 03:42:57.944-06');


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.sales VALUES (1, 2, 1, 1, 9.000, 140.00, 1260.00, 1260.00, 'Efectivo', 'Usuario', 'Principal', NULL, false, NULL, NULL, '2025-09-29 17:31:51.56-06', '2025-09-29 17:31:51.56-06', NULL);
INSERT INTO public.sales VALUES (2, 2, 1, 1, 5.000, 140.00, 700.00, 700.00, 'Efectivo', 'Usuario', 'Principal', 'Venta de prueba', false, NULL, NULL, '2025-09-29 19:29:38.599-06', '2025-09-29 19:29:38.599-06', NULL);
INSERT INTO public.sales VALUES (3, 2, 1, 1, 3.000, 140.00, 420.00, 420.00, 'Efectivo', 'Usuario', 'Principal', 'Venta de prueba con fecha corregida', false, NULL, NULL, '2025-09-29 19:30:13.435-06', '2025-09-29 19:30:13.435-06', NULL);
INSERT INTO public.sales VALUES (4, 2, 1, 1, 2.000, 140.00, 280.00, 280.00, 'Efectivo', 'Usuario', 'Principal', 'Venta de prueba para el 29 de septiembre', false, NULL, NULL, '2025-09-29 19:38:26.587-06', '2025-09-29 19:38:26.587-06', NULL);
INSERT INTO public.sales VALUES (5, 2, 3, 1, 1.000, 250.00, 250.00, 250.00, 'Efectivo', 'Usuario', 'Principal', NULL, false, NULL, NULL, '2025-09-29 19:40:06.329-06', '2025-09-29 19:40:06.329-06', NULL);
INSERT INTO public.sales VALUES (6, 2, 1, 1, 1.000, 140.00, 140.00, 140.00, 'Efectivo', 'Usuario', 'Principal', 'Venta de prueba con fecha corregida', false, NULL, NULL, '2025-09-29 19:45:45.975-06', '2025-09-29 19:45:45.975-06', NULL);
INSERT INTO public.sales VALUES (7, 2, 3, 1, 3.000, 250.00, 750.00, 750.00, 'Transferencia', 'Usuario', 'Principal', NULL, false, NULL, NULL, '2025-09-29 19:47:40.659-06', '2025-09-29 19:47:40.659-06', NULL);
INSERT INTO public.sales VALUES (8, 2, 1, 1, 1.000, 200.00, 200.00, 200.00, 'Efectivo', 'Usuario', 'Principal', 'Venta de prueba con fecha corregida', false, NULL, NULL, '2025-09-29 19:51:04.987-06', '2025-09-29 19:51:04.987-06', NULL);
INSERT INTO public.sales VALUES (9, 2, 1, 1, 5.000, 140.00, 700.00, 700.00, 'Transferencia', 'Usuario', 'MMM', NULL, false, NULL, NULL, '2025-09-29 19:52:39.889-06', '2025-09-29 19:52:39.889-06', NULL);
INSERT INTO public.sales VALUES (10, 2, 3, 1, 1.000, 250.00, 250.00, 250.00, 'Efectivo', 'Usuario', 'MMM', NULL, false, NULL, NULL, '2025-09-29 20:04:03.77-06', '2025-09-29 20:04:03.77-06', NULL);
INSERT INTO public.sales VALUES (11, 2, 3, 1, 1.000, 250.00, 250.00, 250.00, 'Regalo', 'Usuario', 'MMM', NULL, false, NULL, NULL, '2025-09-29 15:29:39.339-06', '2025-09-29 15:29:39.339-06', NULL);
INSERT INTO public.sales VALUES (12, 2, 3, 1, 3.000, 250.00, 750.00, 750.00, 'Consignación', 'Usuario', 'MMM', NULL, false, NULL, NULL, '2025-09-29 15:30:20.109-06', '2025-09-29 15:30:20.109-06', NULL);
INSERT INTO public.sales VALUES (13, 2, 3, 1, 5.000, 250.00, 1250.00, 1250.00, 'Transferencia', 'Usuario', 'MMM', NULL, false, NULL, NULL, '2025-09-30 10:53:48.173-06', '2025-09-30 10:53:48.173-06', NULL);
INSERT INTO public.sales VALUES (14, 2, 6, 1, 1.000, 55.00, 55.00, 55.00, 'Efectivo', 'Usuario', 'Principal', NULL, false, NULL, NULL, '2025-10-01 19:29:21.682-06', '2025-10-01 19:29:21.682-06', 'LK-355');
INSERT INTO public.sales VALUES (15, 2, 6, 1, 2.000, 55.00, 110.00, 110.00, 'Transferencia', 'Usuario', 'Principal', NULL, false, NULL, NULL, '2025-10-01 19:29:52.604-06', '2025-10-01 19:29:52.604-06', NULL);
INSERT INTO public.sales VALUES (16, 2, 3, 1, 1.000, 250.00, 250.00, 250.00, 'Efectivo', 'Usuario', 'MMM', NULL, false, NULL, NULL, '2025-10-01 19:37:28.905-06', '2025-10-01 19:37:28.905-06', 'BH-1');
INSERT INTO public.sales VALUES (17, 2, 5, 1, 5.000, 70.00, 350.00, 350.00, 'Transferencia', 'Usuario', 'Principal', NULL, false, NULL, NULL, '2025-10-01 19:46:50.679-06', '2025-10-01 19:46:50.679-06', 'BG-100');


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: amiguelez
--



--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.transfers VALUES (1, 1, 1, 10.000, 'AP', 'MMM', 'restocking', '2025-09-29 18:51:45.834-06', '2025-09-29 18:51:45.834-06');
INSERT INTO public.transfers VALUES (2, 3, 1, 5.000, 'AP', 'MMM', 'restocking', '2025-09-29 18:53:23.599-06', '2025-09-29 18:53:23.599-06');
INSERT INTO public.transfers VALUES (3, 1, 1, 2.000, 'AP', 'DVP', 'test transfer', '2025-09-29 18:57:19.585-06', '2025-09-29 18:57:19.585-06');
INSERT INTO public.transfers VALUES (4, 3, 1, 10.000, 'AP', 'MMM', 'Reposición de stock', '2025-09-30 16:40:26.049-06', '2025-09-30 16:40:26.049-06');
INSERT INTO public.transfers VALUES (7, 6, 1, 3.000, 'AP', 'MdMM', 'restocking', '2025-10-02 03:19:45.054-06', '2025-10-02 03:19:45.054-06');
INSERT INTO public.transfers VALUES (8, 6, 1, 1.000, 'AP', 'MMM', 'restocking', '2025-10-02 03:22:28.633-06', '2025-10-02 03:22:28.633-06');
INSERT INTO public.transfers VALUES (9, 6, 1, 1.000, 'AP', 'MdMM', 'restocking', '2025-10-02 03:22:53.528-06', '2025-10-02 03:22:53.528-06');
INSERT INTO public.transfers VALUES (10, 3, 1, 10.000, 'AP', 'AME', 'restocking', '2025-10-02 03:26:33.731-06', '2025-10-02 03:26:33.731-06');
INSERT INTO public.transfers VALUES (11, 3, 1, 10.000, 'AME', 'AP', 'destocking', '2025-10-02 03:37:39.691-06', '2025-10-02 03:37:39.691-06');


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

INSERT INTO public.warehouses VALUES (1, 'Almacén Principal', 'AP', 'Dirección principal', NULL, NULL, true, '2025-10-02 01:48:38.255978-06', '2025-10-02 01:56:27.18-06');
INSERT INTO public.warehouses VALUES (3, 'Dana Van Ardsen Palomar', 'DVP', 'Cajuela de Dana', NULL, NULL, true, '2025-10-02 01:48:38.255978-06', '2025-10-02 01:58:05.676-06');
INSERT INTO public.warehouses VALUES (4, 'Mariana de la Mora Martinez', 'MdMM', 'Cajuela de MdMM', NULL, NULL, true, '2025-10-02 02:07:13.077681-06', '2025-10-02 02:07:55.245-06');
INSERT INTO public.warehouses VALUES (2, 'Mariana Martinez Mestas', 'MMM', 'Cajuela de Mariana', '3312422930', 'MMM', true, '2025-10-02 01:48:38.255978-06', '2025-10-02 02:19:04.313-06');
INSERT INTO public.warehouses VALUES (6, 'AME', 'AME', 'Puebla', NULL, NULL, false, '2025-10-02 03:24:12.197269-06', '2025-10-02 03:41:20.379-06');


--
-- Name: batch_packaging_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.batch_packaging_id_seq', 16, true);


--
-- Name: batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.batches_id_seq', 5, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.customers_id_seq', 3, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.expenses_id_seq', 3, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.inventory_id_seq', 20, true);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.inventory_movements_id_seq', 44, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 27, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: packaging_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.packaging_types_id_seq', 4, true);


--
-- Name: production_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.production_batches_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- Name: raw_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.raw_materials_id_seq', 6, true);


--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.recipe_ingredients_id_seq', 6, true);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.recipes_id_seq', 3, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 41, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.sales_id_seq', 19, true);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 1, false);


--
-- Name: transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.transfers_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amiguelez
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 6, true);


--
-- PostgreSQL database dump complete
--

\unrestrict MbfEIiYAkLBxj6EyMjQ2a3kCkSw3SFjaydhPJ3bphmwVZPboiYyehHRnCPikBPO

