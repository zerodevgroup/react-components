const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ModelUtil = require('../utils/model-util')

class Devicetype {

  static find(sort) {
    let promise = new Promise((resolve, reject) => {
      Devicetype.model.find({}).sort(sort).exec().then((devicetypes) => {
        let returnData = []
        let enrichDataPromises = []
        devicetypes.forEach((devicetype) => {
          let document = Object.assign({}, devicetype._doc)
          enrichDataPromises.push(Devicetype.enrichData(document))
        })

        Promise.all(enrichDataPromises).then((returnData) => {
          resolve(returnData)
        })
      })
    })

    return(promise)
  }

  static findById(id) {
    console.log('devicetype findById')
    let promise = new Promise((resolve, reject) => {
      Devicetype.model.findById(id).exec().then((devicetype) => {
        let document = Object.assign({}, devicetype._doc)
        Devicetype.enrichData(document).then((returnDocument) => {
          resolve(returnDocument)
        })
      })
    })

    return(promise)
  }

  static filter(filterString, sort) {
    console.log('devicetype filter')
    filterString  = filterString.replace(/"|'/g,'')

    let filterElements = filterString.split(':')

    let filterKey = filterElements[0]

    let filterValues = filterElements[1].split(',')

    let promise = new Promise((resolve, reject) => {
      Devicetype.model.find({[filterKey]: {$in: filterValues}}).sort(sort).exec().then((devicetypes) => {
        let returnData = []
        let enrichDataPromises = []
        devicetypes.forEach((devicetype) => {
          let document = Object.assign({}, devicetype._doc)
          enrichDataPromises.push(Devicetype.enrichData(document))
        })

        Promise.all(enrichDataPromises).then((returnData) => {
          resolve(returnData)
        })
      })
    })

    return(promise)
  }

  static enrichData(document) {
  let promise = new Promise((resolve, reject) => {
    Devicetype.getSelectItems(document).then((values) => {
      let selectedItemIndex = 0
      if(values.length > 0) {
      }

      // Perform calculations
      /*
        {
          "field": "amountDue",
          "formula": "document['amount'] - document['amountReceived']",
          "type": "formula"
        },
       
      */

    })

    return(promise)
  }

  <%_ if(selectItems.length > 0) { _%>
  static getSelectItems(baseModel) {
    console.log('devicetype getSelectItems')
    let promise = new Promise((resolve, reject) => {
      let selectItemPromises = []
      <%_ selectItems.forEach((selectItem) => { _%>

      // selectItemModel
      let selectItemModelConfig = {
        lookupId: baseModel.<%- selectItem.name %>,
        lookupIdField: '_id',
        lookupModel: <%- selectItem.className %>,
        sortField: 'name'
      }

      let selectItemModelPromise = ModelUtil.getSelectItems(selectItemModelConfig)
      selectItemPromises.push(selectItemModelPromise)
      <%_ }) _%>

      Promise.all(selectItemPromises).then(values => {
        resolve(values)
      })
    })

    return(promise)
  }

  <%_ } _%>

  <%_ if(embeddedItems.length > 0) { _%>
  static getEmbeddedItems(id) {
    console.log('devicetype getEmbeddedItems')
    let promise = new Promise((resolve, reject) => {
      let getEmbeddedItemPromises = []

      <%_ embeddedItems.forEach((embeddedItem) => { _%>
      let embeddedItemNamePluralConfig = {
        id: id,
        idField: 'devicetypeId',
        dataModel: <%- embeddedItem.className %>,
        lookupIdField: '<%- embeddedItem.name %>Id',
        lookupModel: Devicetype_<%- embeddedItem.name %>,
        sortField: 'name',
        dataField: 'embeddedItemNamePlural'
      }

      let embeddedItemNamePluralPromise = ModelUtil.getEmbeddedItems(embeddedItemNamePluralConfig)
      getEmbeddedItemPromises.push(embeddedItemNamePluralPromise)
      <%_ }) _%>

      Promise.all(getEmbeddedItemPromises).then(values => {
        resolve(values)
      })
    })

    return(promise)
  }
  <%_ } _%>

  static search(config) {
    console.log('devicetype search')
    let devicetypes = config.devicetypes
    let searchString = config.searchString
    let jsFilter = config.jsFilter
    let limit = config.limit

    let promise = new Promise((resolve, reject) => {
      let returnData = {
        info: {
          totalCount: devicetypes.length
        },
        documents: []
      }

      if(searchString.length > 0) {
        let searchTerms = searchString.split(/\s/)

        devicetypes.forEach(item => {
          // Create an object that keeps track of which terms matched
          let matchedTerms = {}
          searchTerms.forEach(term => {
            matchedTerms[term] = false
          })

          // Loop through item elements to see if we have a match
          for(let key of Object.keys(item)) {
            // Ignore id fields
            let idTest = new RegExp(/^(.*_id|id)$/)
            if(! idTest.test(key)) {
              searchTerms.forEach(term => {
                let searchPattern = new RegExp(term, 'i')
                if(searchPattern.test(item[key])) {
                  matchedTerms[term] = true
                }
              })
            }
          }

          // Make sure all terms matched
          let isMatch = true
          for(let key of Object.keys(matchedTerms)) {
            if(matchedTerms[key] === false) {
              isMatch = false
            }
          }

          // If we have a match, add the item to the returnData
          if(isMatch) {
            if(jsFilter) {
              const sandbox = { isFilterMatch : false, item: item }
              vm.createContext(sandbox)
              vm.runInContext(jsFilter, sandbox)

              if(sandbox.isFilterMatch === true) {
                returnData.documents.push(item)
              }
            }
            else {
              returnData.documents.push(item)
            }
          }

          returnData.info.matchedCount = returnData.documents.length

        })
      }
      else {
        if(jsFilter) {

          devicetypes.forEach(item => {
            const sandbox = { isFilterMatch : false, item: item }
            vm.createContext(sandbox)
            vm.runInContext(jsFilter, sandbox)

            if(sandbox.isFilterMatch === true) {
              returnData.documents.push(item)
            }
          })
        }
        else {
          returnData.documents = devicetypes
        }
      }

      if(limit != 0) {
        returnData.documents = returnData.documents.splice(0, limit)
        returnData.info.limitCount = returnData.documents.length
      }

      resolve(returnData)
    })

    return(promise)
  }
 
  static create(postData) {
    console.log('devicetype create')
    let promise = new Promise((resolve, reject) => {
      let newDevicetype = Devicetype.model(postData)
      newDevicetype.save().then((devicetype) => {
        <%_ if(parentItem.hasOwnProperty('name')) { _%>
        if(postData.hasOwnProperty('<%- parentItem.name %>Id')) {
          let joinData = {
            <%- parentItem.name %>Id: postData.<%- parentItem.name %>Id,
            devicetypeId: devicetype._id
          }
          let new<%- parentItem.className %>_devicetype = <%- parentItem.className %>_devicetype.model(joinData)
          new<%- parentItem.className %>_devicetype.save().then((<%- parentItem.name %>_devicetype) => {
            resolve(devicetype)
          })
        }
        else {
          resolve(devicetype)
        }
        <%_ } else { _%>
        resolve(devicetype)
        <%_ }  _%>
      })
    })
    return(promise)
  }

  static update(id, postData) {
    console.log('devicetype update')
    let filter = {
      "_id": id
    }
    let promise = Devicetype.model.findOneAndUpdate(filter, postData).exec()

    return(promise)
  }

  static remove(id) {
    console.log('devicetype remove')
    let filter = {
      "_id": id
    }
    let promise = Devicetype.model.findOneAndRemove(filter).exec()

    return(promise)
  }
}

const <%= name %>Schema = new Schema(
  <%- schema %>
);

Devicetype.model = mongoose.model('Devicetype', devicetypeSchema)

// make this available to our users in our Node applications
module.exports = Devicetype
