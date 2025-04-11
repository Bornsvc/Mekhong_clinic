--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
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

--
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: mekong_clinic_owner
--

CREATE SEQUENCE public.patient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_id_seq OWNER TO mekong_clinic_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: mekong_clinic_owner
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


ALTER TABLE public.patients OWNER TO mekong_clinic_owner;

--
-- Name: playing_with_neon; Type: TABLE; Schema: public; Owner: mekong_clinic_owner
--

CREATE TABLE public.playing_with_neon (
    id integer NOT NULL,
    name text NOT NULL,
    value real
);


ALTER TABLE public.playing_with_neon OWNER TO mekong_clinic_owner;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE; Schema: public; Owner: mekong_clinic_owner
--

CREATE SEQUENCE public.playing_with_neon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playing_with_neon_id_seq OWNER TO mekong_clinic_owner;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mekong_clinic_owner
--

ALTER SEQUENCE public.playing_with_neon_id_seq OWNED BY public.playing_with_neon.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: mekong_clinic_owner
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO mekong_clinic_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: mekong_clinic_owner
--

CREATE TABLE public.users (
    id integer DEFAULT nextval('public.users_id_seq'::regclass) NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255) NOT NULL,
    expires_at character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO mekong_clinic_owner;

--
-- Name: playing_with_neon id; Type: DEFAULT; Schema: public; Owner: mekong_clinic_owner
--

ALTER TABLE ONLY public.playing_with_neon ALTER COLUMN id SET DEFAULT nextval('public.playing_with_neon_id_seq'::regclass);


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: mekong_clinic_owner
--

COPY public.patients (id, first_name, middle_name, last_name, birth_date, age, registered, phone_number, gender, medication, balance, diagnosis, address, nationality, social_security_id, social_security_expiration, social_security_company, created_at, updated_at) FROM stdin;
0002716	ທ	ບ່ອນ	ໄຊຍະວົງ ສຸວັນນະຈັກ	2004-11-10	21	2025-04-11 05:37:51.209446	2058975986	ຊາຍ	MedicationMedicationMedication	3000000.00	DiagnosisDiagnosisDiagnosisDiagnosis	AddressAddressAddressAddress	ລາວ	1234566789	2039-11-09	wr3E	2025-04-11 05:37:51.209446	2025-04-11 05:37:51.209446
0002717	ທ		ໄຊຍະວົງ ສຸວັນນະຈັກ fasd	2004-11-09	21	2025-04-11 05:45:35.037511	2058975986	ຊາຍ	MedicationMedicationMedication	3000000.00	DiagnosisDiagnosisDiagnosisDiagnosis	AddressAddressAddressAddress	ລາວ	1234566789	2039-11-08	wr3E	2025-04-11 05:45:35.037511	2025-04-11 06:21:05.349271
\.


--
-- Data for Name: playing_with_neon; Type: TABLE DATA; Schema: public; Owner: mekong_clinic_owner
--

COPY public.playing_with_neon (id, name, value) FROM stdin;
1	c4ca4238a0	0.112447694
2	c81e728d9d	0.24411374
3	eccbc87e4b	0.7025427
4	a87ff679a2	0.42329925
5	e4da3b7fbb	0.32469377
6	1679091c5a	0.011543408
7	8f14e45fce	0.17137155
8	c9f0f895fb	0.8507273
9	45c48cce2e	0.6912433
10	d3d9446802	0.84265244
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mekong_clinic_owner
--

COPY public.users (id, username, password, role, created_at, email, expires_at) FROM stdin;
1	Bornsvc	$2b$10$0dRB58Lcx5ZcDrjABORnSuuGwEQFqiYr5GAMHY88yHmrd2BoFr/sO	admin	2025-04-10 13:06:29.862052+00	Bornsvc@mekong-clinic.com	2026-04-10T20:06:27.288+07:00
\.


--
-- Name: patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mekong_clinic_owner
--

SELECT pg_catalog.setval('public.patient_id_seq', 2718, true);


--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mekong_clinic_owner
--

SELECT pg_catalog.setval('public.playing_with_neon_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mekong_clinic_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: mekong_clinic_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: playing_with_neon playing_with_neon_pkey; Type: CONSTRAINT; Schema: public; Owner: mekong_clinic_owner
--

ALTER TABLE ONLY public.playing_with_neon
    ADD CONSTRAINT playing_with_neon_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mekong_clinic_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_fullname_lower; Type: INDEX; Schema: public; Owner: mekong_clinic_owner
--

CREATE INDEX idx_fullname_lower ON public.patients USING btree (lower((((((first_name)::text || ' '::text) || (middle_name)::text) || ' '::text) || (last_name)::text)));


--
-- Name: patients_lower_first_name_idx; Type: INDEX; Schema: public; Owner: mekong_clinic_owner
--

CREATE INDEX patients_lower_first_name_idx ON public.patients USING btree (lower((first_name)::text));


--
-- Name: patients_lower_last_name_idx; Type: INDEX; Schema: public; Owner: mekong_clinic_owner
--

CREATE INDEX patients_lower_last_name_idx ON public.patients USING btree (lower((last_name)::text));


--
-- Name: patients_lower_middle_name_idx; Type: INDEX; Schema: public; Owner: mekong_clinic_owner
--

CREATE INDEX patients_lower_middle_name_idx ON public.patients USING btree (lower((middle_name)::text));


--
-- Name: patients_phone_number_idx; Type: INDEX; Schema: public; Owner: mekong_clinic_owner
--

CREATE INDEX patients_phone_number_idx ON public.patients USING btree (phone_number);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

