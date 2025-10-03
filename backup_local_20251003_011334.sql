--
-- PostgreSQL database dump
--

\restrict JzGfAplKvbSd6Jg333j6VFoQILosEjpCJoZrgixcw8S2GXRnzsvOzgtXxSzgTUp

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch_packaging; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.batch_packaging (
    id integer NOT NULL,
    batch_id integer NOT NULL,
    product_id integer,
    cantidad_bolsas integer NOT NULL,
    almacen character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_bolsa character varying(50) NOT NULL
);


ALTER TABLE public.batch_packaging OWNER TO amiguelez;

--
-- Name: batch_packaging_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.batch_packaging_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batch_packaging_id_seq OWNER TO amiguelez;

--
-- Name: batch_packaging_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.batch_packaging_id_seq OWNED BY public.batch_packaging.id;


--
-- Name: batches; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.batches (
    id integer NOT NULL,
    codigo_lote character varying(255) NOT NULL,
    recipe_id integer NOT NULL,
    fecha_produccion date,
    cantidad_producida numeric(10,2),
    unidad character varying(255),
    costo_total_calculado numeric(10,2),
    estado text DEFAULT 'planificado'::text,
    notas text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT batches_estado_check CHECK ((estado = ANY (ARRAY['planificado'::text, 'en_proceso'::text, 'completado'::text, 'cancelado'::text])))
);


ALTER TABLE public.batches OWNER TO amiguelez;

--
-- Name: batches_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.batches_id_seq OWNER TO amiguelez;

--
-- Name: batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.batches_id_seq OWNED BY public.batches.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    color character varying(7) DEFAULT '#1976d2'::character varying,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO amiguelez;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO amiguelez;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    email character varying(255),
    telefono character varying(255),
    direccion text,
    tipo text DEFAULT 'Regular'::text NOT NULL,
    notas text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT customers_tipo_check CHECK ((tipo = ANY (ARRAY['Regular'::text, 'Mayorista'::text, 'Consignación'::text, 'VIP'::text])))
);


ALTER TABLE public.customers OWNER TO amiguelez;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_id_seq OWNER TO amiguelez;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    categoria character varying(255) NOT NULL,
    monto numeric(10,2) NOT NULL,
    metodo_pago text NOT NULL,
    responsable character varying(255) NOT NULL,
    fecha date NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    receipt_path character varying(255),
    CONSTRAINT expenses_metodo_pago_check CHECK ((metodo_pago = ANY (ARRAY['Efectivo'::text, 'Transferencia'::text, 'Tarjeta'::text])))
);


ALTER TABLE public.expenses OWNER TO amiguelez;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expenses_id_seq OWNER TO amiguelez;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    product_id integer NOT NULL,
    cantidad numeric(10,3) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    almacen character varying(20) NOT NULL,
    stock_minimo numeric(10,3) DEFAULT '0'::numeric,
    stock_maximo numeric(10,3) DEFAULT '100'::numeric
);


ALTER TABLE public.inventory OWNER TO amiguelez;

--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_id_seq OWNER TO amiguelez;

--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.inventory_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    almacen character varying(50) NOT NULL,
    tipo text NOT NULL,
    cantidad_anterior numeric(10,3) NOT NULL,
    cantidad_movimiento numeric(10,3) NOT NULL,
    cantidad_nueva numeric(10,3) NOT NULL,
    motivo character varying(255) NOT NULL,
    referencia_id integer,
    referencia_tipo character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT inventory_movements_tipo_check CHECK ((tipo = ANY (ARRAY['venta'::text, 'produccion'::text, 'transferencia'::text, 'ajuste'::text])))
);


ALTER TABLE public.inventory_movements OWNER TO amiguelez;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.inventory_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_movements_id_seq OWNER TO amiguelez;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.inventory_movements_id_seq OWNED BY public.inventory_movements.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO amiguelez;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO amiguelez;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO amiguelez;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO amiguelez;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: packaging_types; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.packaging_types (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    etiqueta character varying(50) NOT NULL,
    peso_kg numeric(10,3) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_contenedor character varying(50) DEFAULT 'bolsa'::character varying NOT NULL,
    unidad_medida character varying(10) DEFAULT 'kg'::character varying NOT NULL,
    cantidad numeric(10,3) DEFAULT '1'::numeric NOT NULL
);


ALTER TABLE public.packaging_types OWNER TO amiguelez;

--
-- Name: packaging_types_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.packaging_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.packaging_types_id_seq OWNER TO amiguelez;

--
-- Name: packaging_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.packaging_types_id_seq OWNED BY public.packaging_types.id;


--
-- Name: production_batches; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.production_batches (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    lote_numero character varying(255) NOT NULL,
    cantidad numeric(10,3) NOT NULL,
    costo_total numeric(10,2) NOT NULL,
    costo_unitario numeric(10,2) NOT NULL,
    fecha_produccion date NOT NULL,
    fecha_vencimiento date NOT NULL,
    estado text DEFAULT 'activo'::text NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT production_batches_estado_check CHECK ((estado = ANY (ARRAY['activo'::text, 'vencido'::text, 'agotado'::text])))
);


ALTER TABLE public.production_batches OWNER TO amiguelez;

--
-- Name: production_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.production_batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.production_batches_id_seq OWNER TO amiguelez;

--
-- Name: production_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.production_batches_id_seq OWNED BY public.production_batches.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.products (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    categoria character varying(255) NOT NULL,
    precio numeric(10,2) NOT NULL,
    costo numeric(10,2) DEFAULT '0'::numeric,
    unidad_medida character varying(255) NOT NULL,
    stock_minimo numeric(10,3) DEFAULT '0'::numeric,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.products OWNER TO amiguelez;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO amiguelez;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: raw_materials; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.raw_materials (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    unidad_medida character varying(255) NOT NULL,
    costo_por_unidad numeric(10,2) NOT NULL,
    proveedor character varying(255),
    stock_actual numeric(10,2) DEFAULT '0'::numeric,
    stock_minimo numeric(10,2) DEFAULT '0'::numeric,
    notas text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.raw_materials OWNER TO amiguelez;

--
-- Name: raw_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.raw_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.raw_materials_id_seq OWNER TO amiguelez;

--
-- Name: raw_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.raw_materials_id_seq OWNED BY public.raw_materials.id;


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.recipe_ingredients (
    id integer NOT NULL,
    recipe_id integer NOT NULL,
    raw_material_id integer NOT NULL,
    cantidad numeric(10,3) NOT NULL,
    unidad character varying(255) NOT NULL,
    costo_calculado numeric(10,2),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recipe_ingredients OWNER TO amiguelez;

--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.recipe_ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.recipe_ingredients_id_seq OWNER TO amiguelez;

--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.recipe_ingredients_id_seq OWNED BY public.recipe_ingredients.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    product_id integer,
    rendimiento numeric(10,2) NOT NULL,
    unidad_rendimiento character varying(255) NOT NULL,
    notas text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recipes OWNER TO amiguelez;

--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.recipes_id_seq OWNER TO amiguelez;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role character varying(50) NOT NULL,
    module character varying(100) NOT NULL,
    has_access boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permissions OWNER TO amiguelez;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_permissions_id_seq OWNER TO amiguelez;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    customer_id integer,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    cantidad numeric(10,3) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    metodo_pago text NOT NULL,
    vendedor character varying(255) NOT NULL,
    almacen text NOT NULL,
    notas text,
    cancelada boolean DEFAULT false NOT NULL,
    fecha_cancelacion timestamp with time zone,
    cancelada_por integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_empaque character varying(50),
    CONSTRAINT sales_almacen_check CHECK ((almacen = ANY (ARRAY['Principal'::text, 'MMM'::text, 'DVP'::text]))),
    CONSTRAINT sales_metodo_pago_check CHECK ((metodo_pago = ANY (ARRAY['Efectivo'::text, 'Transferencia'::text, 'Regalo'::text, 'Consignación'::text])))
);


ALTER TABLE public.sales OWNER TO amiguelez;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_id_seq OWNER TO amiguelez;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    user_id integer,
    funcion character varying(255) NOT NULL,
    tipo character varying(255) NOT NULL,
    mensaje text NOT NULL,
    nivel text NOT NULL,
    metadata json,
    ip_address character varying(255),
    user_agent character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT system_logs_nivel_check CHECK ((nivel = ANY (ARRAY['INFO'::text, 'WARNING'::text, 'ERROR'::text, 'SUCCESS'::text])))
);


ALTER TABLE public.system_logs OWNER TO amiguelez;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_logs_id_seq OWNER TO amiguelez;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: transfers; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.transfers (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    cantidad numeric(10,3) NOT NULL,
    almacen_origen character varying(50) NOT NULL,
    almacen_destino character varying(50) NOT NULL,
    motivo character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transfers OWNER TO amiguelez;

--
-- Name: transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transfers_id_seq OWNER TO amiguelez;

--
-- Name: transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.transfers_id_seq OWNED BY public.transfers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role text DEFAULT 'cashier'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'cashier'::text, 'salesperson'::text])))
);


ALTER TABLE public.users OWNER TO amiguelez;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO amiguelez;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: amiguelez
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(20) NOT NULL,
    direccion text,
    telefono character varying(20),
    responsable character varying(100),
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.warehouses OWNER TO amiguelez;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: amiguelez
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.warehouses_id_seq OWNER TO amiguelez;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: amiguelez
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: batch_packaging id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batch_packaging ALTER COLUMN id SET DEFAULT nextval('public.batch_packaging_id_seq'::regclass);


--
-- Name: batches id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batches ALTER COLUMN id SET DEFAULT nextval('public.batches_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: inventory_movements id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN id SET DEFAULT nextval('public.inventory_movements_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: packaging_types id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.packaging_types ALTER COLUMN id SET DEFAULT nextval('public.packaging_types_id_seq'::regclass);


--
-- Name: production_batches id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.production_batches ALTER COLUMN id SET DEFAULT nextval('public.production_batches_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: raw_materials id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.raw_materials ALTER COLUMN id SET DEFAULT nextval('public.raw_materials_id_seq'::regclass);


--
-- Name: recipe_ingredients id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipe_ingredients ALTER COLUMN id SET DEFAULT nextval('public.recipe_ingredients_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Name: transfers id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.transfers ALTER COLUMN id SET DEFAULT nextval('public.transfers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: batch_packaging; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.batch_packaging (id, batch_id, product_id, cantidad_bolsas, almacen, created_at, tipo_bolsa) FROM stdin;
1	1	3	10	Principal	2025-09-29 17:06:18.163-06	1kg
2	1	1	20	Principal	2025-09-29 17:06:18.163-06	0.5kg
3	1	3	5	Principal	2025-09-29 17:06:18.163-06	1kg
4	2	3	15	Principal	2025-09-30 10:37:54.575-06	1kg
5	2	1	20	Principal	2025-09-30 10:37:54.575-06	0.5kg
14	3	4	8	Principal	2025-10-01 19:16:26.666-06	LK-355
15	4	6	8	Principal	2025-10-01 19:27:29.326-06	LK-355
16	5	5	10	Principal	2025-10-01 19:45:48.954-06	BG-100
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.batches (id, codigo_lote, recipe_id, fecha_produccion, cantidad_producida, unidad, costo_total_calculado, estado, notas, created_at, updated_at) FROM stdin;
1	LOTE-20250930-413	1	2025-09-30	25.00	kg	670.00	completado	\N	2025-09-29 17:04:02.875-06	2025-09-29 17:06:18.163-06
2	LOTE-20250930-103	1	2025-09-30	25.00	kg	670.00	completado	\N	2025-09-29 17:16:18.667-06	2025-09-30 10:37:54.575-06
3	LOTE-KBN-20251002-050	2	2025-10-02	3.00	litros	38.00	completado	\N	2025-10-01 18:11:18.026-06	2025-10-01 19:16:26.666-06
4	LOTE-KBN-20251002-228	2	2025-10-02	3.00	litros	38.00	completado	\N	2025-10-01 19:27:10.159-06	2025-10-01 19:27:29.326-06
5	LOTE-GPK-20251002-969	3	2025-10-02	1.00	kg	375.00	completado	\N	2025-10-01 19:40:54.605-06	2025-10-01 19:45:48.954-06
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.categories (id, nombre, descripcion, color, activo, created_at, updated_at) FROM stdin;
1	Granola	Productos de granola artesanal	#673ab7	t	2025-10-01 22:45:39.175478-06	2025-10-01 23:49:50.119-06
2	Snacks	Snacks saludables y frutos secos	#607d8b	t	2025-10-01 22:45:39.175478-06	2025-10-01 23:49:57.852-06
5	Kombucha 	Bebidas Artesanales	#e91e63	t	2025-10-02 00:04:14.916794-06	2025-10-02 00:04:14.916794-06
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.customers (id, nombre, email, telefono, direccion, tipo, notas, activo, created_at, updated_at) FROM stdin;
2	andres miguelez	andres@email.com	2213494926	Prol. de la 15 sur 2307 Casa 11 A C.P. 72764	Regular	El mas guapo de Cholula centro	t	2025-09-29 16:30:56.973-06	2025-09-30 16:31:39.087-06
3	Sergio	sergio@mail.com	3333892666	\N	Consignación	Santa Maria del Pueblito	t	2025-09-30 16:33:26.501-06	2025-09-30 16:33:39.9-06
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.expenses (id, user_id, descripcion, categoria, monto, metodo_pago, responsable, fecha, notas, created_at, updated_at, receipt_path) FROM stdin;
1	1	Tanque de Gasolina	Gasolina	1230.00	Tarjeta	MMM	2025-09-29	\N	2025-09-29 15:59:23.168-06	2025-09-29 15:59:23.168-06	/uploads/receipts/receipt-1759204763158-57576.png
2	1	aceite de coco	Materia Prima	870.00	Efectivo	Dana	2025-09-29	\N	2025-09-29 16:00:08.519-06	2025-09-29 16:00:08.519-06	/uploads/receipts/receipt-1759204808517-235000166.JPG
3	1	servilletas	Otros	100.00	Efectivo	MMM	2025-09-29	Compre servilletas en el oxxo	2025-09-30 10:51:19.762-06	2025-09-30 10:51:36.935-06	/uploads/receipts/receipt-1759272679754-643813830.png
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.inventory (id, product_id, cantidad, created_at, updated_at, almacen, stock_minimo, stock_maximo) FROM stdin;
18	6	2.000	2025-10-02 03:19:45.082-06	2025-10-02 22:24:29.667-06	MdMM	0.000	100.000
14	3	4.000	2025-09-29 18:53:23.611-06	2025-10-02 02:11:09.338-06	MMM	2.000	5.000
2	1	24.000	2025-09-28 22:04:17.946744-06	2025-10-02 02:11:16.255-06	MMM	2.000	5.000
3	1	14.000	2025-09-28 22:04:17.946744-06	2025-10-02 02:22:14.143-06	DVP	2.000	5.000
17	5	5.000	2025-10-01 19:45:48.954-06	2025-10-02 02:11:38.111-06	AP	2.000	5.000
1	1	49.000	2025-09-28 22:04:17.946744-06	2025-10-02 02:12:43.03-06	AP	2.000	5.000
15	4	8.000	2025-10-01 19:16:26.666-06	2025-10-02 02:12:49.876-06	AP	2.000	5.000
19	6	1.000	2025-10-02 03:22:28.644-06	2025-10-02 03:22:28.644-06	MMM	0.000	100.000
16	6	0.000	2025-10-01 19:27:29.326-06	2025-10-02 03:22:53.53-06	AP	2.000	5.000
20	3	0.000	2025-10-02 03:26:33.738-06	2025-10-02 03:37:39.696-06	AME	0.000	100.000
13	3	21.000	2025-09-29 18:52:14.085-06	2025-10-02 03:37:39.699-06	AP	2.000	5.000
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.inventory_movements (id, product_id, user_id, almacen, tipo, cantidad_anterior, cantidad_movimiento, cantidad_nueva, motivo, referencia_id, referencia_tipo, created_at, updated_at) FROM stdin;
2	1	1	MMM	venta	20.000	1.000	19.000	Venta a andres	\N	\N	2025-09-29 17:17:13.926-06	2025-09-29 17:17:13.926-06
4	1	1	DVP	venta	15.000	10.000	5.000	Venta a andres	\N	\N	2025-09-29 17:19:32.024-06	2025-09-29 17:19:32.024-06
6	1	1	DVP	ajuste	5.000	5.000	10.000	Actualización manual de stock	\N	\N	2025-09-29 17:36:19.093-06	2025-09-29 17:36:19.093-06
7	1	1	DVP	ajuste	10.000	2.000	12.000	Actualización manual de stock	\N	\N	2025-09-29 17:36:32.097-06	2025-09-29 17:36:32.097-06
12	1	1	DVP	transferencia	12.000	2.000	12.000	Transferencia desde Principal	3	transfer	2025-09-29 18:57:19.593-06	2025-09-29 18:57:19.593-06
15	1	1	MMM	venta	29.000	5.000	24.000	Venta a andres	\N	\N	2025-09-29 19:52:39.882-06	2025-09-29 19:52:39.882-06
16	3	1	MMM	venta	5.000	1.000	4.000	Venta a andres	\N	\N	2025-09-29 20:04:03.762-06	2025-09-29 20:04:03.762-06
17	3	1	MMM	venta	4.000	1.000	3.000	Venta a andres	\N	\N	2025-09-29 21:29:39.327-06	2025-09-29 21:29:39.327-06
18	3	1	MMM	venta	3.000	3.000	0.000	Venta a andres	\N	\N	2025-09-29 21:30:20.099-06	2025-09-29 21:30:20.099-06
25	3	1	MMM	transferencia	0.000	10.000	0.000	Transferencia desde Principal	4	transfer	2025-09-30 16:40:26.08-06	2025-09-30 16:40:26.08-06
26	3	1	MMM	venta	10.000	5.000	5.000	Venta a andres miguelez	\N	\N	2025-09-30 16:53:48.162-06	2025-09-30 16:53:48.162-06
31	3	1	MMM	venta	5.000	1.000	4.000	Venta a andres miguelez	\N	\N	2025-10-02 01:37:28.896-06	2025-10-02 01:37:28.896-06
1	1	1	AP	venta	45.000	5.000	40.000	Venta a andres	\N	\N	2025-09-29 16:59:13.303-06	2025-09-29 16:59:13.303-06
3	1	1	AP	venta	40.000	10.000	30.000	Venta a andres	\N	\N	2025-09-29 17:17:51.174-06	2025-09-29 17:17:51.174-06
5	1	1	AP	venta	30.000	9.000	21.000	Venta a andres	\N	\N	2025-09-29 17:31:51.552-06	2025-09-29 17:31:51.552-06
9	3	1	AP	ajuste	0.000	10.000	10.000	Creación de item de inventario	\N	\N	2025-09-29 18:52:14.088-06	2025-09-29 18:52:14.088-06
11	1	1	AP	transferencia	11.000	-2.000	9.000	Transferencia a DVP	3	transfer	2025-09-29 18:57:19.593-06	2025-09-29 18:57:19.593-06
13	3	1	AP	venta	5.000	1.000	4.000	Venta a andres	\N	\N	2025-09-29 19:40:06.322-06	2025-09-29 19:40:06.322-06
14	3	1	AP	venta	4.000	3.000	1.000	Venta a andres	\N	\N	2025-09-29 19:47:40.65-06	2025-09-29 19:47:40.65-06
19	3	1	AP	produccion	1.000	10.000	11.000	Producción de lote LOTE-20250930-413	1	batch	2025-09-29 17:06:18.163-06	2025-09-29 17:06:18.163-06
20	1	1	AP	produccion	9.000	20.000	29.000	Producción de lote LOTE-20250930-413	1	batch	2025-09-29 17:06:18.163-06	2025-09-29 17:06:18.163-06
21	3	1	AP	produccion	11.000	5.000	16.000	Producción de lote LOTE-20250930-413	1	batch	2025-09-29 17:06:18.163-06	2025-09-29 17:06:18.163-06
22	3	1	AP	produccion	16.000	15.000	31.000	Producción de lote LOTE-20250930-103	2	batch	2025-09-30 10:37:54.575-06	2025-09-30 10:37:54.575-06
23	1	1	AP	produccion	29.000	20.000	49.000	Producción de lote LOTE-20250930-103	2	batch	2025-09-30 10:37:54.575-06	2025-09-30 10:37:54.575-06
24	3	1	AP	transferencia	31.000	-10.000	21.000	Transferencia a MMM	4	transfer	2025-09-30 16:40:26.08-06	2025-09-30 16:40:26.08-06
27	4	1	AP	produccion	0.000	8.000	8.000	Producción de lote LOTE-KBN-20251002-050	3	batch	2025-10-01 19:16:26.666-06	2025-10-01 19:16:26.666-06
28	6	1	AP	produccion	0.000	8.000	8.000	Producción de lote LOTE-KBN-20251002-228	4	batch	2025-10-01 19:27:29.326-06	2025-10-01 19:27:29.326-06
29	6	1	AP	venta	8.000	1.000	7.000	Venta a andres miguelez	\N	\N	2025-10-02 01:29:21.677-06	2025-10-02 01:29:21.677-06
30	6	1	AP	venta	7.000	2.000	5.000	Venta a andres miguelez	\N	\N	2025-10-02 01:29:52.597-06	2025-10-02 01:29:52.597-06
32	5	1	AP	produccion	0.000	10.000	10.000	Producción de lote LOTE-GPK-20251002-969	5	batch	2025-10-01 19:45:48.954-06	2025-10-01 19:45:48.954-06
33	5	1	AP	venta	10.000	5.000	5.000	Venta a andres miguelez	\N	\N	2025-10-02 01:46:50.673-06	2025-10-02 01:46:50.673-06
35	6	1	AP	transferencia	2.000	-1.000	1.000	Transferencia a MMM	8	transfer	2025-10-02 03:22:28.646-06	2025-10-02 03:22:28.646-06
36	6	1	MMM	transferencia	0.000	1.000	1.000	Transferencia desde AP	8	transfer	2025-10-02 03:22:28.646-06	2025-10-02 03:22:28.646-06
37	6	1	AP	transferencia	1.000	-1.000	0.000	Transferencia a MdMM	9	transfer	2025-10-02 03:22:53.532-06	2025-10-02 03:22:53.532-06
38	6	1	MdMM	transferencia	3.000	1.000	3.000	Transferencia desde AP	9	transfer	2025-10-02 03:22:53.532-06	2025-10-02 03:22:53.532-06
39	3	1	AP	transferencia	21.000	-10.000	11.000	Transferencia a AME	10	transfer	2025-10-02 03:26:33.739-06	2025-10-02 03:26:33.739-06
40	3	1	AME	transferencia	0.000	10.000	10.000	Transferencia desde AP	10	transfer	2025-10-02 03:26:33.739-06	2025-10-02 03:26:33.739-06
41	3	1	AME	transferencia	10.000	-10.000	0.000	Transferencia a AP	11	transfer	2025-10-02 03:37:39.7-06	2025-10-02 03:37:39.7-06
42	3	1	AP	transferencia	11.000	10.000	11.000	Transferencia desde AME	11	transfer	2025-10-02 03:37:39.7-06	2025-10-02 03:37:39.7-06
43	6	1	MdMM	venta	4.000	1.000	3.000	Venta a andres miguelez	\N	\N	2025-10-02 22:22:42.807-06	2025-10-02 22:22:42.807-06
44	6	1	MdMM	venta	3.000	1.000	2.000	Venta a andres miguelez	\N	\N	2025-10-02 22:24:29.669-06	2025-10-02 22:24:29.669-06
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
1	001_create_users.js	1	2025-09-28 22:04:09.287-06
2	002_create_customers.js	1	2025-09-28 22:04:09.354-06
3	003_create_products.js	1	2025-09-28 22:04:09.41-06
4	004_create_inventory.js	1	2025-09-28 22:04:09.439-06
5	005_create_sales.js	1	2025-09-28 22:04:09.477-06
6	006_create_inventory_movements.js	1	2025-09-28 22:04:09.51-06
7	007_create_transfers.js	1	2025-09-28 22:04:09.538-06
8	008_create_production_batches.js	1	2025-09-28 22:04:09.564-06
9	009_create_expenses.js	1	2025-09-28 22:04:09.58-06
10	010_create_system_logs.js	1	2025-09-28 22:04:09.598-06
11	011_add_receipt_path_to_expenses.js	2	2025-09-29 21:53:14.899-06
12	012_create_raw_materials.js	3	2025-09-29 22:26:09.728-06
13	013_create_recipes.js	3	2025-09-29 22:26:09.744-06
14	014_create_batches.js	3	2025-09-29 22:26:09.756-06
15	20251001014053_create_role_permissions_table.js	4	2025-10-02 00:16:00.008-06
17	20251002043701_create_categories_table.js	5	2025-10-02 00:16:11.921-06
18	20251001024035_add_salesperson_role.js	6	2025-10-02 00:16:17.071-06
19	20251002061523_create_packaging_types_table.js	6	2025-10-02 00:16:17.083-06
20	20251002063842_add_container_type_and_unit_to_packaging_types.js	7	2025-10-02 00:38:58.214-06
21	20251002065543_change_batch_packaging_tipo_bolsa_to_string.js	8	2025-10-02 00:56:15.338-06
22	20251002071500_add_tipo_empaque_to_sales.js	9	2025-10-02 01:21:18.694-06
23	20251002075000_create_warehouses_table.js	10	2025-10-02 01:48:31.625-06
24	20251002080000_add_stock_limits_and_dynamic_warehouse.js	11	2025-10-02 02:03:46.747-06
25	20250102090000_standardize_inventory_warehouse_codes.js	12	2025-10-02 02:40:23.193-06
26	20250102100000_update_transfers_warehouse_constraints.js	13	2025-10-02 03:16:46.412-06
27	20250102101000_update_inventory_movements_warehouse_constraints.js	14	2025-10-02 03:21:30.592-06
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: packaging_types; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.packaging_types (id, nombre, etiqueta, peso_kg, activo, created_at, updated_at, tipo_contenedor, unidad_medida, cantidad) FROM stdin;
1	BH-1	Bolsa presentación 1 kg	1.000	t	2025-10-02 00:16:22.969923-06	2025-10-02 00:34:07.891924-06	bolsa	kg	1.000
4	LK-355	Lata kombucha presentación 355 ml	0.355	t	2025-10-02 00:42:47.121899-06	2025-10-02 01:11:22.430332-06	lata	mL	355.000
3	BG-100	Bolsa presentación 100 g	0.100	t	2025-10-02 00:16:22.969923-06	2025-10-02 01:44:37.726-06	bolsa	g	100.000
2	BH-1/2	Bolsa presentación 1/2 kg	0.500	t	2025-10-02 00:16:22.969923-06	2025-10-02 01:44:59.478-06	bolsa	kg	0.500
\.


--
-- Data for Name: production_batches; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.production_batches (id, product_id, user_id, lote_numero, cantidad, costo_total, costo_unitario, fecha_produccion, fecha_vencimiento, estado, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.products (id, nombre, descripcion, categoria, precio, costo, unidad_medida, stock_minimo, activo, created_at, updated_at) FROM stdin;
5	Garapiñados Keto	Garapiñados Keto presentación 100 g	Snacks	70.00	35.00	g	2.000	t	2025-09-30 16:29:00.274-06	2025-09-30 16:30:20.829-06
1	Healthynola 1/2 kg	Granola Regular presentación 1/2 kg	Granola	140.00	60.00	kg	10.000	t	2025-09-28 22:04:17.926345-06	2025-09-29 19:09:20.061-06
3	Healthynola 1 kg	Granola Regular presentación 1 kg	Granola	250.00	125.00	kg	10.000	t	2025-09-29 17:40:30.932-06	2025-09-29 19:10:02.927-06
4	Healthynola Keto 1/2 kg	Granola Keto presentación 1/2 kg	Granola	200.00	100.00	kg	2.000	t	2025-09-30 16:27:46.494-06	2025-09-30 16:28:01.073-06
6	Kombucha Natural	Kombucha presentación 355 ml	Kombucha 	55.00	10.00	ml	10.000	t	2025-10-02 00:06:33.193-06	2025-10-02 00:09:43.078-06
\.


--
-- Data for Name: raw_materials; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.raw_materials (id, nombre, descripcion, unidad_medida, costo_por_unidad, proveedor, stock_actual, stock_minimo, notas, activo, created_at, updated_at) FROM stdin;
2	Aceite de Agave	Aceite de Agave	litros	270.00	La sirenita	1.00	0.00	\N	t	2025-09-29 16:53:38.837-06	2025-09-29 16:53:38.837-06
3	Nuez	Nuez de Peacan	kg	780.00	Alejandro	1.00	0.00	Cotizar Nuez con otro proveedor para ver si mejoramos el precio 30/9/25	t	2025-09-30 10:46:45.499-06	2025-09-30 10:46:45.499-06
1	Coco	Coco rayado	kg	400.00	Mercado de abasto	1.00	0.00	\N	t	2025-09-29 16:53:08.481-06	2025-09-30 10:46:55.822-06
5	Azucar	Azucar morena	kg	70.00	Mercado de Abasto	0.50	1.00	\N	t	2025-10-01 18:08:42.462-06	2025-10-01 19:16:26.666-06
4	Agua	Agua purificada	litros	3.00	Agua Purificada Zapopan	1.00	1.00	\N	t	2025-10-01 18:08:06.957-06	2025-10-01 19:27:29.326-06
6	cacahuate	cacahuate	kg	375.00	La ardilla	1.00	1.00	\N	t	2025-10-01 19:39:56.335-06	2025-10-01 19:39:56.335-06
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.recipe_ingredients (id, recipe_id, raw_material_id, cantidad, unidad, costo_calculado, created_at, updated_at) FROM stdin;
1	1	2	1.000	kg	270.00	2025-09-29 16:55:00.274-06	2025-09-29 16:55:00.274-06
2	1	1	1.000	kg	400.00	2025-09-29 16:55:11.527-06	2025-09-29 16:55:11.527-06
3	1	3	2.000	kg	1560.00	2025-09-30 10:48:38.27-06	2025-09-30 10:48:38.27-06
4	2	4	1.000	litros	3.00	2025-10-01 18:10:31.748-06	2025-10-01 18:10:31.748-06
5	2	5	0.500	kg	35.00	2025-10-01 18:10:52.388-06	2025-10-01 18:10:52.388-06
6	3	6	1.000	kg	375.00	2025-10-01 19:40:19.658-06	2025-10-01 19:40:19.658-06
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.recipes (id, nombre, descripcion, product_id, rendimiento, unidad_rendimiento, notas, activo, created_at, updated_at) FROM stdin;
1	Healthynola 	Granola Regular	3	25.00	kg	\N	t	2025-09-29 16:54:41.671-06	2025-09-29 16:54:41.671-06
2	Kombucha Natural	Kombucha Natural	6	3.00	litros	\N	t	2025-10-01 18:10:07.42-06	2025-10-01 18:10:07.42-06
3	Garapiñados Keto	Garapiñados Keto	5	1.00	kg	\N	t	2025-10-01 19:38:38.428-06	2025-10-01 19:38:38.428-06
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.role_permissions (id, role, module, has_access, created_at, updated_at) FROM stdin;
1	admin	dashboard	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
2	admin	sales	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
3	admin	customers	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
4	admin	transfers	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
5	admin	expenses	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
6	admin	reports	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
7	admin	inventory	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
8	admin	products	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
9	admin	production	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
10	admin	raw-materials	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
11	admin	recipes	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
12	admin	batches	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
13	admin	users	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
14	admin	settings	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
15	manager	dashboard	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
16	manager	sales	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
17	manager	customers	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
18	manager	transfers	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
19	manager	expenses	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
20	manager	reports	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
21	manager	inventory	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
22	manager	products	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
23	manager	production	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
24	manager	raw-materials	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
25	manager	recipes	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
26	manager	batches	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
32	salesperson	dashboard	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
33	salesperson	sales	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
34	salesperson	customers	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
35	salesperson	products	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
36	salesperson	inventory	t	2025-10-01 22:45:39.187912-06	2025-10-01 22:45:39.187912-06
37	cashier	customers	f	2025-10-02 03:42:57.944-06	2025-10-02 03:42:57.944-06
38	cashier	dashboard	t	2025-10-02 03:42:57.944-06	2025-10-02 03:42:57.944-06
39	cashier	inventory	f	2025-10-02 03:42:57.944-06	2025-10-02 03:42:57.944-06
40	cashier	products	f	2025-10-02 03:42:57.944-06	2025-10-02 03:42:57.944-06
41	cashier	sales	f	2025-10-02 03:42:57.944-06	2025-10-02 03:42:57.944-06
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.sales (id, customer_id, product_id, user_id, cantidad, precio_unitario, subtotal, total, metodo_pago, vendedor, almacen, notas, cancelada, fecha_cancelacion, cancelada_por, created_at, updated_at, tipo_empaque) FROM stdin;
1	2	1	1	9.000	140.00	1260.00	1260.00	Efectivo	Usuario	Principal	\N	f	\N	\N	2025-09-29 17:31:51.56-06	2025-09-29 17:31:51.56-06	\N
2	2	1	1	5.000	140.00	700.00	700.00	Efectivo	Usuario	Principal	Venta de prueba	f	\N	\N	2025-09-29 19:29:38.599-06	2025-09-29 19:29:38.599-06	\N
3	2	1	1	3.000	140.00	420.00	420.00	Efectivo	Usuario	Principal	Venta de prueba con fecha corregida	f	\N	\N	2025-09-29 19:30:13.435-06	2025-09-29 19:30:13.435-06	\N
4	2	1	1	2.000	140.00	280.00	280.00	Efectivo	Usuario	Principal	Venta de prueba para el 29 de septiembre	f	\N	\N	2025-09-29 19:38:26.587-06	2025-09-29 19:38:26.587-06	\N
5	2	3	1	1.000	250.00	250.00	250.00	Efectivo	Usuario	Principal	\N	f	\N	\N	2025-09-29 19:40:06.329-06	2025-09-29 19:40:06.329-06	\N
6	2	1	1	1.000	140.00	140.00	140.00	Efectivo	Usuario	Principal	Venta de prueba con fecha corregida	f	\N	\N	2025-09-29 19:45:45.975-06	2025-09-29 19:45:45.975-06	\N
7	2	3	1	3.000	250.00	750.00	750.00	Transferencia	Usuario	Principal	\N	f	\N	\N	2025-09-29 19:47:40.659-06	2025-09-29 19:47:40.659-06	\N
8	2	1	1	1.000	200.00	200.00	200.00	Efectivo	Usuario	Principal	Venta de prueba con fecha corregida	f	\N	\N	2025-09-29 19:51:04.987-06	2025-09-29 19:51:04.987-06	\N
9	2	1	1	5.000	140.00	700.00	700.00	Transferencia	Usuario	MMM	\N	f	\N	\N	2025-09-29 19:52:39.889-06	2025-09-29 19:52:39.889-06	\N
10	2	3	1	1.000	250.00	250.00	250.00	Efectivo	Usuario	MMM	\N	f	\N	\N	2025-09-29 20:04:03.77-06	2025-09-29 20:04:03.77-06	\N
11	2	3	1	1.000	250.00	250.00	250.00	Regalo	Usuario	MMM	\N	f	\N	\N	2025-09-29 15:29:39.339-06	2025-09-29 15:29:39.339-06	\N
12	2	3	1	3.000	250.00	750.00	750.00	Consignación	Usuario	MMM	\N	f	\N	\N	2025-09-29 15:30:20.109-06	2025-09-29 15:30:20.109-06	\N
13	2	3	1	5.000	250.00	1250.00	1250.00	Transferencia	Usuario	MMM	\N	f	\N	\N	2025-09-30 10:53:48.173-06	2025-09-30 10:53:48.173-06	\N
14	2	6	1	1.000	55.00	55.00	55.00	Efectivo	Usuario	Principal	\N	f	\N	\N	2025-10-01 19:29:21.682-06	2025-10-01 19:29:21.682-06	LK-355
15	2	6	1	2.000	55.00	110.00	110.00	Transferencia	Usuario	Principal	\N	f	\N	\N	2025-10-01 19:29:52.604-06	2025-10-01 19:29:52.604-06	\N
16	2	3	1	1.000	250.00	250.00	250.00	Efectivo	Usuario	MMM	\N	f	\N	\N	2025-10-01 19:37:28.905-06	2025-10-01 19:37:28.905-06	BH-1
17	2	5	1	5.000	70.00	350.00	350.00	Transferencia	Usuario	Principal	\N	f	\N	\N	2025-10-01 19:46:50.679-06	2025-10-01 19:46:50.679-06	BG-100
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.system_logs (id, user_id, funcion, tipo, mensaje, nivel, metadata, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.transfers (id, product_id, user_id, cantidad, almacen_origen, almacen_destino, motivo, created_at, updated_at) FROM stdin;
1	1	1	10.000	AP	MMM	restocking	2025-09-29 18:51:45.834-06	2025-09-29 18:51:45.834-06
2	3	1	5.000	AP	MMM	restocking	2025-09-29 18:53:23.599-06	2025-09-29 18:53:23.599-06
3	1	1	2.000	AP	DVP	test transfer	2025-09-29 18:57:19.585-06	2025-09-29 18:57:19.585-06
4	3	1	10.000	AP	MMM	Reposición de stock	2025-09-30 16:40:26.049-06	2025-09-30 16:40:26.049-06
7	6	1	3.000	AP	MdMM	restocking	2025-10-02 03:19:45.054-06	2025-10-02 03:19:45.054-06
8	6	1	1.000	AP	MMM	restocking	2025-10-02 03:22:28.633-06	2025-10-02 03:22:28.633-06
9	6	1	1.000	AP	MdMM	restocking	2025-10-02 03:22:53.528-06	2025-10-02 03:22:53.528-06
10	3	1	10.000	AP	AME	restocking	2025-10-02 03:26:33.731-06	2025-10-02 03:26:33.731-06
11	3	1	10.000	AME	AP	destocking	2025-10-02 03:37:39.691-06	2025-10-02 03:37:39.691-06
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.users (id, name, email, password, role, active, last_login, created_at, updated_at) FROM stdin;
2	Gerente	manager@healthynola.com	$2a$10$GjoYSCUxtOJPlEUTIpgrvOz1jRU158Xymb.wUd/dg6z912.kfRn2q	manager	t	2025-09-30 19:07:31.492-06	2025-09-28 22:04:17.914407-06	2025-09-28 22:04:17.914407-06
3	Cajero Demo	cashier@healthynola.com	$2a$10$V5xA9VVXNViLMoCgBKofCu8cEM0aT7b9tRT3kkhBop5aQeOfmUreS	cashier	t	2025-10-02 03:43:18.052-06	2025-09-28 22:04:17.914407-06	2025-09-28 22:04:17.914407-06
1	Administrador	admin@healthynola.com	$2a$10$a9BdaLaUgFuKEapvf1vje.Td5ipWGWwGHFCP7QFibGmYT5gTXbjiG	admin	t	2025-10-02 22:23:45.28-06	2025-09-28 22:04:17.914407-06	2025-09-28 22:04:17.914407-06
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: amiguelez
--

COPY public.warehouses (id, nombre, codigo, direccion, telefono, responsable, activo, created_at, updated_at) FROM stdin;
1	Almacén Principal	AP	Dirección principal	\N	\N	t	2025-10-02 01:48:38.255978-06	2025-10-02 01:56:27.18-06
3	Dana Van Ardsen Palomar	DVP	Cajuela de Dana	\N	\N	t	2025-10-02 01:48:38.255978-06	2025-10-02 01:58:05.676-06
4	Mariana de la Mora Martinez	MdMM	Cajuela de MdMM	\N	\N	t	2025-10-02 02:07:13.077681-06	2025-10-02 02:07:55.245-06
2	Mariana Martinez Mestas	MMM	Cajuela de Mariana	3312422930	MMM	t	2025-10-02 01:48:38.255978-06	2025-10-02 02:19:04.313-06
6	AME	AME	Puebla	\N	\N	f	2025-10-02 03:24:12.197269-06	2025-10-02 03:41:20.379-06
\.


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
-- Name: batch_packaging batch_packaging_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batch_packaging
    ADD CONSTRAINT batch_packaging_pkey PRIMARY KEY (id);


--
-- Name: batches batches_codigo_lote_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_codigo_lote_unique UNIQUE (codigo_lote);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: categories categories_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_nombre_unique UNIQUE (nombre);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: packaging_types packaging_types_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.packaging_types
    ADD CONSTRAINT packaging_types_nombre_unique UNIQUE (nombre);


--
-- Name: packaging_types packaging_types_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.packaging_types
    ADD CONSTRAINT packaging_types_pkey PRIMARY KEY (id);


--
-- Name: production_batches production_batches_lote_numero_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.production_batches
    ADD CONSTRAINT production_batches_lote_numero_unique UNIQUE (lote_numero);


--
-- Name: production_batches production_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.production_batches
    ADD CONSTRAINT production_batches_pkey PRIMARY KEY (id);


--
-- Name: products products_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_nombre_unique UNIQUE (nombre);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: raw_materials raw_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.raw_materials
    ADD CONSTRAINT raw_materials_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_module_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_module_unique UNIQUE (role, module);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_codigo_unique UNIQUE (codigo);


--
-- Name: warehouses warehouses_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_nombre_unique UNIQUE (nombre);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: categories_activo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX categories_activo_index ON public.categories USING btree (activo);


--
-- Name: categories_nombre_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX categories_nombre_index ON public.categories USING btree (nombre);


--
-- Name: customers_activo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX customers_activo_index ON public.customers USING btree (activo);


--
-- Name: customers_email_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX customers_email_index ON public.customers USING btree (email);


--
-- Name: customers_nombre_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX customers_nombre_index ON public.customers USING btree (nombre);


--
-- Name: customers_tipo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX customers_tipo_index ON public.customers USING btree (tipo);


--
-- Name: expenses_categoria_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX expenses_categoria_index ON public.expenses USING btree (categoria);


--
-- Name: expenses_fecha_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX expenses_fecha_index ON public.expenses USING btree (fecha);


--
-- Name: expenses_responsable_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX expenses_responsable_index ON public.expenses USING btree (responsable);


--
-- Name: expenses_user_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX expenses_user_id_index ON public.expenses USING btree (user_id);


--
-- Name: inventory_almacen_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_almacen_index ON public.inventory USING btree (almacen);


--
-- Name: inventory_movements_almacen_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_movements_almacen_index ON public.inventory_movements USING btree (almacen);


--
-- Name: inventory_movements_created_at_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_movements_created_at_index ON public.inventory_movements USING btree (created_at);


--
-- Name: inventory_movements_product_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_movements_product_id_index ON public.inventory_movements USING btree (product_id);


--
-- Name: inventory_movements_referencia_id_referencia_tipo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_movements_referencia_id_referencia_tipo_index ON public.inventory_movements USING btree (referencia_id, referencia_tipo);


--
-- Name: inventory_movements_tipo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_movements_tipo_index ON public.inventory_movements USING btree (tipo);


--
-- Name: inventory_movements_user_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_movements_user_id_index ON public.inventory_movements USING btree (user_id);


--
-- Name: inventory_product_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX inventory_product_id_index ON public.inventory USING btree (product_id);


--
-- Name: production_batches_estado_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX production_batches_estado_index ON public.production_batches USING btree (estado);


--
-- Name: production_batches_fecha_produccion_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX production_batches_fecha_produccion_index ON public.production_batches USING btree (fecha_produccion);


--
-- Name: production_batches_fecha_vencimiento_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX production_batches_fecha_vencimiento_index ON public.production_batches USING btree (fecha_vencimiento);


--
-- Name: production_batches_lote_numero_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX production_batches_lote_numero_index ON public.production_batches USING btree (lote_numero);


--
-- Name: production_batches_product_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX production_batches_product_id_index ON public.production_batches USING btree (product_id);


--
-- Name: production_batches_user_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX production_batches_user_id_index ON public.production_batches USING btree (user_id);


--
-- Name: products_activo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX products_activo_index ON public.products USING btree (activo);


--
-- Name: products_categoria_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX products_categoria_index ON public.products USING btree (categoria);


--
-- Name: products_nombre_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX products_nombre_index ON public.products USING btree (nombre);


--
-- Name: role_permissions_module_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX role_permissions_module_index ON public.role_permissions USING btree (module);


--
-- Name: role_permissions_role_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX role_permissions_role_index ON public.role_permissions USING btree (role);


--
-- Name: sales_almacen_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_almacen_index ON public.sales USING btree (almacen);


--
-- Name: sales_cancelada_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_cancelada_index ON public.sales USING btree (cancelada);


--
-- Name: sales_created_at_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_created_at_index ON public.sales USING btree (created_at);


--
-- Name: sales_customer_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_customer_id_index ON public.sales USING btree (customer_id);


--
-- Name: sales_metodo_pago_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_metodo_pago_index ON public.sales USING btree (metodo_pago);


--
-- Name: sales_product_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_product_id_index ON public.sales USING btree (product_id);


--
-- Name: sales_tipo_empaque_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_tipo_empaque_index ON public.sales USING btree (tipo_empaque);


--
-- Name: sales_user_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_user_id_index ON public.sales USING btree (user_id);


--
-- Name: sales_vendedor_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX sales_vendedor_index ON public.sales USING btree (vendedor);


--
-- Name: system_logs_created_at_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX system_logs_created_at_index ON public.system_logs USING btree (created_at);


--
-- Name: system_logs_funcion_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX system_logs_funcion_index ON public.system_logs USING btree (funcion);


--
-- Name: system_logs_nivel_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX system_logs_nivel_index ON public.system_logs USING btree (nivel);


--
-- Name: system_logs_tipo_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX system_logs_tipo_index ON public.system_logs USING btree (tipo);


--
-- Name: system_logs_user_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX system_logs_user_id_index ON public.system_logs USING btree (user_id);


--
-- Name: transfers_almacen_destino_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX transfers_almacen_destino_index ON public.transfers USING btree (almacen_destino);


--
-- Name: transfers_almacen_origen_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX transfers_almacen_origen_index ON public.transfers USING btree (almacen_origen);


--
-- Name: transfers_created_at_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX transfers_created_at_index ON public.transfers USING btree (created_at);


--
-- Name: transfers_product_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX transfers_product_id_index ON public.transfers USING btree (product_id);


--
-- Name: transfers_user_id_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX transfers_user_id_index ON public.transfers USING btree (user_id);


--
-- Name: users_active_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX users_active_index ON public.users USING btree (active);


--
-- Name: users_email_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX users_email_index ON public.users USING btree (email);


--
-- Name: users_role_index; Type: INDEX; Schema: public; Owner: amiguelez
--

CREATE INDEX users_role_index ON public.users USING btree (role);


--
-- Name: batch_packaging batch_packaging_batch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batch_packaging
    ADD CONSTRAINT batch_packaging_batch_id_foreign FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


--
-- Name: batch_packaging batch_packaging_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batch_packaging
    ADD CONSTRAINT batch_packaging_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: batches batches_recipe_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_recipe_id_foreign FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE RESTRICT;


--
-- Name: expenses expenses_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: inventory_movements inventory_movements_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: inventory_movements inventory_movements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: inventory inventory_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: production_batches production_batches_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.production_batches
    ADD CONSTRAINT production_batches_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: production_batches production_batches_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.production_batches
    ADD CONSTRAINT production_batches_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: recipe_ingredients recipe_ingredients_raw_material_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_raw_material_id_foreign FOREIGN KEY (raw_material_id) REFERENCES public.raw_materials(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_foreign FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipes recipes_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: sales sales_cancelada_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_cancelada_por_foreign FOREIGN KEY (cancelada_por) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sales sales_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: sales sales_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: sales sales_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: system_logs system_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: transfers transfers_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: transfers transfers_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: amiguelez
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict JzGfAplKvbSd6Jg333j6VFoQILosEjpCJoZrgixcw8S2GXRnzsvOzgtXxSzgTUp

