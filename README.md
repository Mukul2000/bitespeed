# Bitespeed Assignment

Hi, this is the repo for bitespeed backend task. Please read this before evaluating the submission as it will streamline the process.

There are 4 endpoints I have created - 
1. POST /identify --> assignment requirement
2. GET /contacts --> utility endpoint to see all the data in the db.
3. POST /checkout --> Endpoint to add new checkout / contact rows. This is where the logic is to assign primary and secondary contacts.
4. DELETE /db --> Utility endpoint for the evaluator, they can start from a clean slate when evaluating edge cases each time.

The associated Postman / Insomnia collection has been attached. named Insomnia_2023-08-14.json.

## The stack
I have used - 
1. NestJS Framework ( Fancy Node.js, I use this at work so I am comfortable using it )
2. Typescript
3. TypeORM
4. SQLite ( simplest tool that does the job for this task ).

## Pointers for the code

You'll **find all the relevant code in contacts folder** ( module in NestJS ).
- Entity file will contain the schema description with typeORM.
- All API endpoints will be in controller file.
- All business logic resides in contact.service.ts file.


## The logic
I believe the code is fairly well commented and logic should not be too difficult, but I will provide my thought process in short here.

The task can be broken down into 2 sections: 
1. The producer ( where the checkout details are received and the data inserted into the db )
2. The consumer ( POST /identify endpoint ).

### The producer

When I receive any data ( phone or email ) I basically query the db for any records matching either the phone or email.
A few cases emerge -
1. If there are no existing records in db, this is a new primary contact.
2. Check for exact match for the data received in DB. If there is one, the new checkout doesn't contain any new information and no db inserts happen.
3. In the last case, we either have some new info, or the information we received links two records together. We make the necessary changed in the db. We always make sure **oldest record becomes the primary.**

### The consumer
We receive the input data ( phone or email ).
1. Fetch records which have same phone or email in sorted order by id.
2. Fetch all records which are -
    a. Having id as linkedId ( In the case identify endpoint receives data of a secondary end point )
    b. Having linkedId equal to first record in point 1 ( Oldest is the  primary )
3. Then we sort this data and form our response structure.


I have tried to optimise this in what little time I had. I assume this is probably an internal endpoint and doesn't need tons of optimisations in the time given. Nevertheless, I found the problem interesting and would love to discuss how it has been solved at Bitespeed.


### Afterthoughts / Other solutions I thought out

We can keep an inverted index for phone and email. So the data for identify endpoint will come from that.

Index can be like this -
phoneNumber:
"2249": [ <contact row id1>, <contact row id2> ... ],
"246788": ....

Similary for emails.

I believe this should speed up the performance of the identify endpoint greatly.







Thanks for your time in evaluating this, looking forward to hearing from you.

