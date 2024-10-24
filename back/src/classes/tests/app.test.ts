import http from "http"; 
import io from "../../app.js"
import app from "../../app.js"

let httpServer: http.Server;
let port: number;

beforeAll((done) => {
  // Create a new HTTP server and attach socket.io to it
  httpServer = http.createServer();
  io.attach(httpServer);

  // Start listening on a random available port
  httpServer.listen(0, () => {
    port = (httpServer.address() as any).port; // Dynamically assigned port
    //console.log(`Test server running on port ${port}`);
    done();
  });
});

afterAll((done) => {
  // Close the HTTP server after all tests
  httpServer.close(() => {
    //console.log("Test server closed");
    done();
  });
});

test("Test server side ", () => {
    
    })