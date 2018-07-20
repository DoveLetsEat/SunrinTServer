const express = require('express');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/data');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

const Park = mongoose.model('Park', { name: String, latitude: String, longtitude: String, weekdayStartTime: String, weekdayEndTime: String, satDayStartTime: String, satDayEndTime: String, holiDayStartTime: String, holiDayEndTime: String, costInfo: String, startCost: String, startTime: String, moreCost: String, moreTime: String, address: String });

app.post('/pLocations', (req, res) => {
    let x = req.body.latitude / 0.0090138;
    let y = req.body.longtitude / 0.010954102;
    let cost = req.body.cost;

    Park.find(cost == "free" ? {costInfo: "무료"} : cost == "price" ? {costInfo: "유료"} : {}, (err, data) => {
        if(err) {
            res.json({ header: {
                errorMessage: err.message,
                response: false
            }});
            return;
        }
        let newData = [];
        let count = 0;
        data.forEach(element => {
            count++;
            let distanceSquare = ((element.latitude / 0.0090138 - x) * (element.latitude / 0.0090138 - x) + (element.longtitude / 0.010954102 - y) * (element.longtitude / 0.010954102 - y));
            if (distanceSquare <= 9) {
                newData.push({
                    latitude: element.latitude,
                    longtitude: element.longtitude,
                    name: element.name,
                    id: element._id,
                    distance: Math.sqrt(distanceSquare) * 1000
                });
            }
            if (count == data.length) {
                res.json({
                    header: { response: true },
                    data: { data: newData.sort((a, b) => a.distance - b.distance) },
                });
            }
        });
    });
});

app.post('/pMoreInfo', (req, res) => {
    Park.findOne({ _id: req.body.id }, (err, data) => {
        if(err) {
            res.json({header: {
                response: false,
                errorMessage: err.message
            },
            data: {
                data: data
            }});
            return res.status(500).send();
        }
        res.json({
            header: {
                response: true
            },
            data: data
        });
    });
});

module.exports = app;