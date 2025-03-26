--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

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
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: lost_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO lost_user;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: lost_user
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    report_type character varying NOT NULL,
    item_name character varying NOT NULL,
    description character varying NOT NULL,
    location character varying NOT NULL,
    contact_details character varying NOT NULL,
    date character varying NOT NULL,
    "time" character varying,
    image_path character varying,
    user_id integer
);


ALTER TABLE public.posts OWNER TO lost_user;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: lost_user
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO lost_user;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lost_user
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: lost_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL
);


ALTER TABLE public.users OWNER TO lost_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: lost_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO lost_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lost_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: lost_user
--

COPY public.alembic_version (version_num) FROM stdin;
4e49c182649d
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: lost_user
--

COPY public.posts (id, report_type, item_name, description, location, contact_details, date, "time", image_path, user_id) FROM stdin;
5	Lost	Mobile	Lost mobile near swimming pool	RAC	12324354556	2025-03-21	16:21	\N	2
6	Lost	ewagawg	asdgarg	asgarg	123353523	2025-03-29	16:34	\N	2
7	Lost	lost cat	lost cat near IT building	RAC	123456789	2025-03-20	16:54	\N	2
8	Found	cat	cat found	RAC	123343	2025-03-20	16:58	\N	3
9	Lost	photoframe	photoframe	photoframe	123456	2025-03-20	17:00	backend/uploads/like-icon.png	3
10	Found	Nivya	Nivya lost	poppp	12345567	2025-03-21	22:50	backend/uploads/user-avatar.png	2
11	Lost	Gold ring	lost gold ring near library	library	1234567	2025-03-04	01:38	\N	2
12	Lost	lost id card	lost id card near RAC bus stop	RAC	1234566	2025-03-20	01:38	\N	2
13	Lost	passport	lost passport near IT building	IT building	12345	2025-03-11	01:39	\N	2
1	Lost	ring	ring lost near college	library	4103013855	2025-03-20	19:39	\N	1
2	Lost	Water Bottle	Black sipper near gym	Fitness center	555-1234	2025-03-21	16:00	\N	1
3	Found	Bike	Found bike at RAC	RAC	4103011127	2025-03-27	16:02	\N	1
14	Lost	gold chain	gold chain lost	rac	123455	2025-03-10	12:20	\N	3
15	Lost	passport	lost passport	library	12345677	2025-03-06	12:21	\N	3
16	Lost	id card 	lost id card	dunkins 	134546577	2025-03-07	12:21	\N	3
17	Lost	lost gold iphone	lost gold iphone near swimming pool	RAC	123456789	2025-03-13	18:59	\N	3
18	Lost	ksadkhwjdhb	mqwsbqwjdhnms	rac	93814672678	2025-03-22	07:59	\N	3
19	Lost	gold ring	dfegfnhhgn	rac	8754231134	2025-03-22	18:59	\N	3
20	Lost	gold ring	fayaaz fgfjhgrfsdfghn	rac	987654321	2025-03-22	08:02	\N	3
21	Lost	gold ring	fayaaz	rac	0987654321	2025-03-22	08:04	\N	3
22	Lost	gold ring	fayaaz	rac	0987654321	2025-03-22	08:07	\N	3
23	Found	Gold ring	Found gold ring near library entrance	UMBC Library	12345678	2025-03-23	07:29	\N	2
24	Found	leather wallet	Black leather wallet with student ID and cash found in RAC gym.	RAC	123456678	2025-03-22	19:48	\N	2
25	Found	iPhone 13 Pro	Silver iPhone with cracked screen found on the Quad.	Main Quad	123456789	2025-03-22	22:48	\N	2
26	Found	AirPods Pro	Found in bathroom near The Commons.	The Commons	1234545667	2025-03-23	21:49	\N	2
27	Lost	maxi	kwdjkwusfhsg	rac	0987654321	2025-03-23	22:12	\N	2
28	Lost	Gold wallet	Gold wallet lost in the college	rac	0987654321	2025-03-22	22:15	\N	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: lost_user
--

COPY public.users (id, username, email, password) FROM stdin;
1	admin	admin@example.com	admin123
2	nivya	nivya@example.com	nivya123
3	fayaaz	fayaaz@example.com	fayaaz123
\.


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lost_user
--

SELECT pg_catalog.setval('public.posts_id_seq', 28, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lost_user
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ix_posts_id; Type: INDEX; Schema: public; Owner: lost_user
--

CREATE INDEX ix_posts_id ON public.posts USING btree (id);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: lost_user
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lost_user
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

