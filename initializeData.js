/* jshint esversion:6*/
// Start dotenv
const dotenv = require('dotenv');
const result = dotenv.config();

const dateFormat = require('dateformat')

const mongoose = require('mongoose');
if (process.env.NODE_ENV === "production") {
    mongoaddr = process.env.mongoProd;
} else {
    mongoaddr= process.env.mongoDev;
}

mongoose.connect(mongoaddr, {
    useNewUrlParser: true
}, (err) => {
    if (err) {
        console.log(err.message)
    } else {
        console.log(`MongoDB connection to ${mongoaddr} succeeded.`)
    }
});

const Roles = require('./models/roles');
const Item = require('./models/item');
const User = require('./models/user');
const Budget = require('./models/budget');

Roles.deleteMany({}, (err) => {
    if (err) return console.log('Roles drop error');
});

var fall18spring19budgets = {
    "Steward": {
        Fall18: 2500,
        Spring18: 2500
    },
    "Summer Storage": {
        Fall18: 750,
        Spring18: 750
    },
    "House/Assistant House": {
        Fall18: 2500,
        Spring18: 2500
    },
    "House - Summer": {
        Fall18: 0,
        Spring18: 3000
    },
    'Capital Improvement': {
        Fall18: 7500,
        Spring18: 7500
    }, 
    'Dumpster': {
        Fall18: 2500,
        Spring18: 2500
    },
    'Electric': {
        Fall18: 12000,
        Spring18: 14000
    },
    'Gas/Heating': {
        Fall18: 4500,
        Spring18: 8000
    }, 
    'Terminix': {
        Fall18: 200,
        Spring18: 200
    },
    'Van': {
        Fall18: 2500,
        Spring18: 2500
    },
    'Water & Sewer': {
        Fall18: 5000,
        Spring18: 7000
    },
    'Workweek': {
        Fall18: 3000,
        Spring18: 2000
    },
    'IRDF Operating': {
        Fall18: 0,
        Spring18: 2500
    },
    'Rush': {
        Fall18: 16500,
        Spring18: 1000
    },
    'Rush Food Stuff': {
        Fall18: 18000,
        Spring18: 2500
    },
    'BDD': {
        Fall18: 5000,
        Spring18: 1500
    },
    'BDD IAP Retreat': {
        Fall18: 0,
        Spring18: 5000
    },
    'Social': {
        Fall18: 5250,
        Spring18: 5250
    },
    'Social-Semiformal': {
        Fall18: 4000,
        Spring18: 4000
    },
    'Alumni': {
        Fall18: 2500,
        Spring18: 1000
    },
    'Athletic': {
        Fall18: 350,
        Spring18: 350
    },
    'Tech': {
        Fall18: 180,
        Spring18: 180
    },
    'CommServe/Philanthropy': {
        Fall18: 500,
        Spring18: 500
    },
    'Composite': {
        Fall18: 500,
        Spring18: 0
    },
    'ExecComm': {
        Fall18: 300,
        Spring18: 300
    },
    'Jerseys': {
        Fall18: 0,
        Spring18: 1000
    },
    'Paddles': {
        Fall18: 0,
        Spring18: 350
    },
    'Senior Trip': {
        Fall18: 0,
        Spring18: 1600
    },
    'Treasurer': {
        Fall18: 100,
        Spring18: 100
    },
    'Safety': {
        Fall18: 0,
        Spring18: 20000
    }
};

function createBudgets(budget) {
    Object.keys(budget).forEach(name => {
        Object.keys(budget[name]).forEach(semester => {
            Budget.create({
                name,
                semester,
                amount: budget[name][semester]
            });
        });
    });

}

Budget.deleteMany({}, (err) => {
    if (err) return console.log('Budget drop error');
    createBudgets(fall18spring19budgets);
});


const permissions = require('./controllers/api/permissions');
var perms = [];
permissions.buildPermissions(['global'], permissions.permissionContext, permissions.permissionType)
.forEach(permission => {
    perms.push(permission.value);
});
Roles.create({
    roleName: 'admin',
    permissions: perms
});

Item.deleteMany({}, (err) => {
    if (err) return console.log('Items drop error');
    Item.create({
        name: 'John Doe',
        email: 'test@gmail.com',
        description: 'description1',
        amount: 10.50,
        budget: 'Safety.Fall18',
        date: dateFormat(Date.now(), 'fullDate'),
        reimbursementType: 'Housebill Credit',
        additionalInfo: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
        status: 'opened',
        attachments: ['none', 'none']
    });
    Item.create({
        name: 'Johnny Bui',
        email: 'jbui@mit.edu',
        description: 'description2',
        amount: 200.00,
        budget: 'Alumni.Spring19',
        date: dateFormat(Date.now(), 'fullDate'),
        reimbursementType: 'Housebill Credit',
        additionalInfo: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
        status: 'opened',
        attachments: ['none', 'none']
    });
});
