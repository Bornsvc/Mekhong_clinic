--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Homebrew)
-- Dumped by pg_dump version 17.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: born
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    action character varying(255) NOT NULL,
    table_name character varying(255) NOT NULL,
    record_id integer NOT NULL,
    changed_data jsonb,
    changed_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    resource_type character varying(100),
    resource_id integer NOT NULL,
    details text,
    old_details text
);


ALTER TABLE public.audit_logs OWNER TO born;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: born
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO born;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: born
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: born
--

CREATE SEQUENCE public.patient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_id_seq OWNER TO born;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: born
--

CREATE TABLE public.patients (
    id character varying(7) DEFAULT lpad((nextval('public.patient_id_seq'::regclass))::text, 7, '0'::text) NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    birth_date date NOT NULL,
    age integer,
    registered timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone_number character varying(20),
    gender character varying(10),
    medication text,
    balance numeric(10,2) DEFAULT 0,
    diagnosis text,
    address text,
    nationality character varying(100),
    social_security_id character varying(50),
    social_security_expiration date,
    social_security_company character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patients OWNER TO born;

--
-- Name: users; Type: TABLE; Schema: public; Owner: born
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255) NOT NULL,
    expires_at character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO born;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: born
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO born;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: born
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: born
--

COPY public.audit_logs (id, action, table_name, record_id, changed_data, changed_by, created_at, user_id, resource_type, resource_id, details, old_details) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: born
--

COPY public.patients (id, first_name, middle_name, last_name, birth_date, age, registered, phone_number, gender, medication, balance, diagnosis, address, nationality, social_security_id, social_security_expiration, social_security_company, created_at, updated_at) FROM stdin;
0000001	Katui T_T	ບ່ອນ	 ສຸວັນນະຈັກ	2004-11-15	21	2025-04-10 17:36:49.846589	2058975986	male	fasdfa	2000000.00	sdafsdafads	daffdsafsd	ລາວ	12432321321	2029-11-15	fdasfdsaf	2025-04-10 17:36:49.846589	2025-04-10 17:36:49.846589
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: born
--

COPY public.users (id, username, password, role, created_at, email, expires_at) FROM stdin;
2	Bornsvc	$2b$10$qeU4cOoaueBOjK3aCBSlD.jcq4n2h0u6QuYmkBE0sJHqEp7E.2cQq	admin	2025-04-10 17:34:13.368805+07	Bornsvc@mekong-clinic.com	2026-04-10T17:34:13.357+07:00
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: born
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, true);


--
-- Name: patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: born
--

SELECT pg_catalog.setval('public.patient_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: born
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_expires_at_key; Type: CONSTRAINT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_expires_at_key UNIQUE (expires_at);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: born
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

