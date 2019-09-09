-- we don't know how to generate schema pigeon (class Schema) :(
create table accounts
(
	user_id varchar(255) not null
		primary key,
	registration_id text not null,
	platform_version varchar(50) not null,
	app_version varchar(50) not null,
	session_secret text null,
	created_at varchar(255) null
)
;

create table contacts
(
	user_id varchar(255) null,
	contact_number varchar(255) null,
	displayname varchar(255) null,
	isRegistered int(3) null
)
;

create table groups
(
	conversation_id varchar(255) not null
		primary key,
	name varchar(255) null,
	thumbnail text null,
	icon_key varchar(255) null,
	created_at varchar(255) null,
	creator_id varchar(255) not null
)
;

create table messages
(
	id varchar(255) not null
		primary key,
	recipient_id varchar(255) null,
	sender_id varchar(255) null,
	data text null,
	created_at varchar(255) null,
	message_type varchar(100) null
)
;

create index id
	on messages (id)
;

create table participants
(
	conversation_id varchar(255) not null,
	user_id varchar(255) not null,
	role varchar(50) null
)
;

create table prekeys
(
	user_id varchar(255) not null,
	key_id int(10) not null,
	pub_key text not null
)
;

create table profile
(
	user_id varchar(255) not null
		primary key,
	full_name varchar(255) null,
	avatar text null,
	thumbnail text null,
	bio varchar(255) null
)
;

create table signalkeys
(
	user_id varchar(255) not null PRIMARY KEY ,
	identity_key varchar(255) null,
	signature varchar(255) null,
	key_id int(10) null,
	pub_key varchar(255) null
)
;

