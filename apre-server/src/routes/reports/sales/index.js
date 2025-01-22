/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const { Collection } = require('mongodb');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});

router.get('/sales-data', (req, res, next) =>{
  try {
    mongo (async db =>{
      const salesData = await db.collection('sales').find().toArray();
      res.send(salesData);
    }, next);
  } catch(err) {
    console.error('Error getting sales data:', err);
    next(err);

  }
});

router.get('/sales-data', (req, res, next) => {
  try {
    mongo(async (db) => {
      const salesData = await db.collection('sales').find().toArray();

      // If no sales data is found, return an empty array with 200 OK status
      if (salesData.length === 0) {
        return res.status(200).json([]); // Return an empty array with a 200 OK status
      }

      res.status(200).json(salesData); // Return sales data if found
    }, next);
  } catch (err) {
    console.error('Error getting sales data:', err);
    next(err); // Pass error to the next middleware (error handler)
  }
});

router.get('/sales-data/:region/:startDate/:endDate', (req, res, next) => {
  try {
    const { region, startDate, endDate } = req.params;
    mongo(async (db) => {
      const salesData = await db
        .collection('sales')
        .find({
          region: region,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        })
        .toArray();

      res.status(200).json(salesData);
    }, next);
  } catch (err) {
    console.error('Error fetching sales data by region and time period:', err);
    next(err);
  }
});





module.exports = router;