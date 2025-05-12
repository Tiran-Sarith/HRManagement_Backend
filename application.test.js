const request = require("supertest");
const app = require("../server"); // your Express app
const path = require("path");

describe("POST /applications/Aadd", () => {
  it("should submit an application and return an evaluation result", async () => {
    const res = await request(app)
      .post("/applications/Aadd")
      .field("name", "Test User")
      .field("email", "test@example.com")
      .field("portfolio", "https://github.com/test")
      .field("phoneNo", "0771234567")
      .field("introduction", "I am a passionate developer")
      .field("jobTitle", "Software Engineer")
      .field("vacancyId", "someValidVacancyId")
      .field("jobRequirements", "Must have JavaScript, Node.js skills")
      .attach("file", path.join(sample_cv, "sample_cv.pdf"));

    expect(res.statusCode).toBe(200);
    expect(res.body.evaluation).toHaveProperty("score");
    expect(res.body.evaluation).toHaveProperty("questions");
  });
});
