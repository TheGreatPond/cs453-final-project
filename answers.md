## Part 1. - Conceptual Foundations
### 1. Authentication vs. Authorization
Explain the difference between authentication and authorization. Then describe what an API should return in each situation:

- The request does not contain valid authentication credentials.

- The caller is authenticated but does not have permission to perform the requested operation.

Include the appropriate HTTP status code for each situation.

**A.** Authentication is to verify who the user interacting with the system is. Authorization is to verify that the authenticated user has access to the requested resource.

In the even that the request does not contain valid authentication credentials, the server should respond with a 401 error stating that the credentials were invalid. 

In the event that the caller is authenticated but does not have permission to perform the requested operation, the server should respond with a 403 error stating that access to the requested resource is forbidden for the user.

### 2. Passwords, Sessions, and Tokens

An application allows users to log in with a username and password.

Explain:

- why the application should never store passwords as plain text,

- what the server should store instead,

- how a session-based login differs from a token-based login,

- one advantage of each approach.

**A.** The server should never store passwords in plain text due to the risk of a databreach exposing the credentails of end users. Instead, applications should store their passwords in a hashed form that cannot be easily reversed so that in the event of a data breach, no real passwords would be compromised.

A session based login differs from a token based login in that a session stores login state on the server and uses a cookie to identify the client and a token based authentication merely uses the token to sign request from client to server in order to get access to resources.

Session based authentication has the advantage of holding state for the session and could hold information such as a cart for an online shopping platform while token based authentication can be used in stateless systems where a session is not necessary.

### 3. JSON Web Tokens

Describe the purpose and structure of a JSON Web Token (JWT). Your answer should include:

- the three major parts of a JWT,

- the difference between signing and encrypting a token,

- why a server must validate a JWT before trusting its claims,

- one risk of using JWTs with excessively long expiration times.

**A.** The three major parts of a JWT are the header(describes the token type and signing alogrithm), payload (holds the claims that the jwt is making such as what user this is), and the signature (the portion used to verify the previous information). 

JWT's are typically signed meaning that they can be decoded back into plain text, but their integrity can be checked by a secret on the server but are not encrypted (encryption can typically not be undone to bring the information back to plain text).

Servers should validate a JWT using the signature before trusting its claims so that users do not create a JWT with claims to an admin account that were not created by the authenication server.

If JWTs are given an excessively long expiration time and are accidently leaked, that JWT could be used by malicious actors to gain access to resources they are not intended to be able to access.

### 4. OAuth

Explain the purpose of OAuth. Your answer should distinguish among:

- the resource owner,

- the client application,

- the authorization server,

- the resource server,

- the access token.

Also explain why giving a third-party application an OAuth access token is safer than giving it the user’s password.

**A.** OAuth is an authorization framework about delegation. A resource owner (the user), interacts with a client application (front end) and request access to a resource that they own. The client application reaches out to the auth server (google) for permission to act as the resource owner which is granted in the form of an authorization token. Once the client app receives an authorization token from the OAuth server, it creates an access token to then reach out to the resource server to fetch the requested information for the resource owner.

Using OAuth access tokens can be safer than using a username and password due to the heightened security standard that these OAuth providers hold themselves to compared to much smaller operations.

### 5. PKI and Certificates

Explain how a digital certificate helps a client establish a secure connection to an API server. Your answer should include:

- the purpose of the server’s public and private keys,

- the role of a certificate authority,

- what the client verifies in the certificate,

- what could happen if certificate validation were skipped.

**A.** Public keys are shared with everyone, while private keys are stored as securely as passwords. Public keys are used for decrypting things encrypted with public keys. 

Before trusting a server certificate, a client checks if the certificate signed by a trusted Certificate Authority (the source of truth as to what certificates are valid), if the certificate is currently valid, if the hostname matches the certificate, if the certificate is allowed to identify a server, if the certificate has been revoked,and if the server can prove it owns the private key. If any of these items fail in the verification path, the client should not establish a trusted connection.


### 6. Databases, Messages, and Asynchronous Processing

An API receives a request to generate a large report. Producing the report may take several minutes.

Explain why the API should normally use asynchronous processing instead of keeping the HTTP request open. Describe a reasonable design that includes:

- a database record representing the requested job,
- a message queue,
- a background worker,
- an immediate HTTP response,
- a way for the client to check the job’s status.

Include the successful HTTP status code for submitting the job and the successful status code for retrieving its current status.

**A.** You would use an asyunchronous system when you are willing to trade simplicity for flexibility and resilience since an asynchronous system allows the client to return to the work that it was doing and possibly accomplish other task while the server is attempting to process the request.

A client would send a request to the asynchronous service which would recieve the request, the message broker of the service would place the http request in a message queue where they will wait to be consumed by the service. Once the message was successfully placed in the message queue, the service would inform the client it had successfully received the request with a 202 status code. Eventually that message would be dealt with by a background worker within the asynchronous system and could be checked on by the client at a later time. If the client were to reach out for the status of the request it had previously made the server would return a code of 200 when successfully returning the status of the request.

## Part 2.

### 1. Authentication and Authorization

For each request below, state whether it should be allowed or rejected. If it is rejected, provide the appropriate HTTP status code.

Request	Decision and Status Code
- A request contains no access token	
  - Rejected, code 401
- A request contains an expired JWT	
  - Rejected, code 401
- A student requests one of their own tasks	
  - Accepted, code 200
- A student requests another student’s task	
  - Rejected, code 403
- An instructor requests a task belonging to any student	
  - Accepted, code 200

- Briefly explain where authentication ends and authorization begins when processing these requests.
  - Authentication ends as soon as we are sure who the user making a request is by verifying that they have a valid access token. Once we are sure who the requestor is, we can then assess what permissions that user has as part of authorization.

### 2. OAuth, JWT, and PKI Design

Describe how the API should use OAuth, JWTs, and PKI when handling a request. Your design should identify:

- who issues the access token,

- how the client sends the token to the API,

- what the API must validate before trusting the JWT,

- how HTTPS and the server’s certificate protect the connection,

- why the API must not trust a role supplied in the request body.

All traffic between client, api, and OAuth server should utilize PKI to secure traffic through the use of SSL certs to verify that everyone knows that they are communicating with the parties that they truly intend to. This would include the api and oauth server providing a public certificate signed by a trusted root certificate authority for communicating between each other, or in an mtls environment, even having the client provide a cert to authenticate with the api and oauth server as well.

The api speaks to the OAuth server to validate who the user is, once the user is authenticated, the api generates access tokens that include claims about the user that will use this token as well as a signature that the api can check to ensure that the access token is genuine when it is presented to the api again in future calls as an Authorization header in future http request. Without this signature, the api, could have no idea if the claims made by the JWT were genuine and they would not be trusted.

### 3. Database and Asynchronous Report Processing

Design the report-generation portion of the API. Provide:

- a method and URI for requesting a new report,

- the database record created for the report job,

- the message placed on the queue,

- the immediate HTTP status code and response body,

- a method and URI for checking the report’s status,

- the changes made by the background worker when processing succeeds or fails.

Your design must not keep the original HTTP request open while the report is generated.

The client could use "POST <my_host>:<my_port>/api/reports" for the URI to create a new report. For most users (Students) they could choose to leave the body empty and the report could be generated for the user identified in the JWT. However for admins (Instructors), they could opt to include a body that had a student_name parameter which could be used to identify a user to generate the report for

Once the server received the request, it would respond to the server with a 202 to state that it had received the request as well as a response body that included the report job 

```json
{
  "id": "report-17",
  "studentId": "djs001",
  "status": "pending",
  "downloadUrl": null
}
```

The job could be represented by the database with a schema that matches the response above. With a primary key of "id", foreign key of "studentId", and status and download also being held as useful values in the DB.

If processing the report was successful, the backgroundworker could generate a download url and change the status of the report job to complete. If not, the download link would remain null, but the status could be set to failed.

a user could then use the method and URI "GET <my_host>:<my_port>/api/reports/<my_report's_id>" (for example localhost:3000/api/reports/report-17) which could respond with a similar json body that gave the current status of the report and the corresponding download link if it was finished

```json
{
  "id": "report-17",
  "studentId": "djs001",
  "status": "complete",
  "downloadUrl": "localhost:/3000/reports/downloads/report-17"
}
```

## Part 3.

### 4. Error Classification
- No access token was provided
  -  401 unauthorized
- The JWT has expired	
  - 401 unauthorized
- The JWT signature is invalid	
  - 401 unauthorized
- A validly authenticated student attempts an instructor-only operation	
  - 403 Forbidden

## Part 4.

### 2. Database and Asynchronous Behavior

- Why should the task ID be supplied as a query parameter instead of being inserted directly into the SQL string?
  - To make it easier to replace/ build more easily readable code that we can later modify
- Why must the route use await when calling db.query()?
  - If we did not wait for the response from the database, we would risk returning an undefined result if the rest of the function completed before the database query was returned.

## Part 5.

### 3. Queue Behavior

- why the API returns 202 Accepted instead of 200 OK or 201 Created,
  - the API returns 202 since it is telling the client that the work is not completed yet and it is not returning a completed item which is usually signified by a 200 status code, but it has successfully been queued

- one advantage of generating the report in a background worker instead of inside the route handler.
  - we can queue multiple reports to be generated and come back at a much later date and expect them all to be complete rather than needing to stay at the keyboard as each report is generated

## Part 6. OpenAPI Specification

See openapi-task.yaml

## Part 7 — Reflection

### 1. Following a Request Through the System
Choose one protected API operation and trace it from the client’s request to the server’s response.

Explain how at least four of the following participate in processing the request:

- HTTP,

- Express routing,

- middleware,

- authentication,

- authorization,

- database access,

- error handling,

- OpenAPI documentation.

Identify one place where the request could fail and explain how the API should respond.

**A.** Lets say a client wanted to get a list of all of the task within our database. The easiest way for us to do this would be to open our OpenAPI document in a VScode extension, enter their auth token in the authorize menu, expand the tab for "GET /tasks", and then hit "Try it out", and then execute. This will send an HTTP request to our server. The first item that our request would hit is the Express router which would then call the function specified for our method of "GET" and our route of /tasks. The request would then get passed to the authenticateToken function to verify that our JWT is valid (authneticating us) and then move to the requireRole.js middleware to ensure that we are part of a role that is allowed to use the "GET /tasks" route (making sure we are authorized for our request). After passing both authorization, we would then get into the function to get taskj itself which makes a request to our database for the information we request before returning that data in an http response.

If we were to fail authorization and not belong to one of the groups necessary for the route, the authorization middleware, would return a "403 Forbidden" error and prevent us from making a request to the database to retrieve our requested information.

2. 