var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
mongoose.connect('mongodb://localhost/demo');
mongoose.Promise = global.Promise;

var paperItemSchema = new Schema({
  info: String,
  createTime: {
    type: Number,
    default: new Date().getTime()
  }
});

var PaperItem = mongoose.model('PaperItem', paperItemSchema);

var paperSchema = new Schema({
  paperId: String,
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'PaperItem'
  }]
});

var Paper = mongoose.model('Paper', paperSchema);

var p1 = new Paper({paperId: 2});
var item0 = new PaperItem({
  info: 'bbbbb'
});
var item = new PaperItem({
  info: 'aaaaaa'
});

async.waterfall([
  (done)=> {
    async.map([Paper, PaperItem], (model, cb)=> {
      model.remove({}, cb)
    }, done)
  },
  // (data, done)=> {

  //     PaperItem.remove({},()=> {
  //         done(null, null)
  //     });
  // },
  (data, done)=> {
    item0.save();
    item.save(()=> {
      done(null, null);
    });

  },
  (data, done)=> {
    p1.items = [item._id, item0._id];
    p1.save(()=> {
      done(null, null);
    });
  }
], (err, data)=> {
  // 介个只能是ObjectId
  const itemId = item._id;
  Paper.aggregate()
      .unwind('$items')
      .match({items: itemId})
      .exec((err, doc)=> {
        Paper.populate(doc, {path: 'items'}, (err, doc)=> {
          console.log(doc);
          process.exit(0);
        });

      })
})
