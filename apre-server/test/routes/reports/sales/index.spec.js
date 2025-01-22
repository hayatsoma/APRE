/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the sales report API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');
const { Collection } = require('mongodb');

jest.mock('../../../../src/utils/mongo');

// Test the sales report API
describe('Apre Sales Report API - Regions', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions endpoint
  it('should fetch a list of distinct sales regions', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['North', 'South', 'East', 'West'])
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/regions'); // Send a GET request to the sales/regions endpoint

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual(['North', 'South', 'East', 'West']); // Expect the response body to match the expected data
  });

  // Test the sales/regions endpoint with no regions found
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/sales/invalid-endpoint'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the sales/regions endpoint with no regions found
  it('should return 200 with an empty array if no regions are found', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/regions');

    expect(response.status).toBe(200); // Expect a 200 status code
    expect(response.body).toEqual([]); // Expect the response body to match the expected data
  });
});

// Test the sales report API
describe('Apre Sales Report API - Sales by Region', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the sales/regions/:region endpoint
  it('should fetch sales data for a specific region, grouped by salesperson', async () => {
    mongo.mockImplementation(async (callback) => {
      // Mock the MongoDB collection
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              salesperson: 'John Doe',
              totalSales: 1000
            },
            {
              salesperson: 'Jane Smith',
              totalSales: 1500
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/regions/north'); // Send a GET request to the sales/regions/:region endpoint
    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        salesperson: 'John Doe',
        totalSales: 1000
      },
      {
        salesperson: 'Jane Smith',
        totalSales: 1500
      }
    ]);
  });

  it('should return 200 and an empty array if no sales data is found for the region', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/sales/regions/unknown-region');

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 404 for an invalid endpoint', async () => {
    // Make a request to an invalid endpoint
    const response = await request(app).get('/api/reports/sales/invalid-endpoint');

    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});

describe('APRE Sales Report API - Sales Data', () =>{
  it('should fetch a list of sales data', async () =>{
    mongo.mockImplementation(async (callback) =>{
      const db = {
        Collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              {id: 1, total: 100}
            ])
          })
        })
      };

      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/sales-data');

    // asserts
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual([{id: 1, total: 100}]);
  });

  it('should return an empty array when there are no sales', async () => {

    mongo.mockImplementation(async (callback) =>{
      const db={
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        })
     }

      await callback(db)
    });

    const response = await request(app).get('/api/reports/sales/sales-data');

    // asserts
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual([]);

  });


});
describe('APRE Sales Report API - Sales Data by Region and Time Period', () =>{

  //test fetching sales data by region and time period
  it('should fetch sales data by region and time period', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { region: 'North', date: '2025-01-10', total: 100 },
          ]),
        }),
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/sales-data/North/2025-01-01/2025-01-31');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ region: 'North', date: '2025-01-10', total: 100 }]);
  });

  it('should return an empty array if region is invalid', async () => {
    // Mock the MongoDB interaction to simulate the behavior of the database
    mongo.mockImplementation(async (callback) => {
      const db = {
        // Simulate the 'collection' method, returning a mocked collection object
        collection: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/sales/sales-data/InvalidRegion/2025-01-01/2025-01-31');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });



   // Test with no sales data within the specified time period
   it('should return an empty array if no sales data found within the time period', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };

      await callback(db);
    });

    const response = await request(app).get(
      '/api/reports/sales/sales-data/North/2025-01-01/2025-01-31'
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
})
