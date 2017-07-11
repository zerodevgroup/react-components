const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Role = require('./role')

const ModelUtil = require('../utils/model-util')

class User {

  static find(sort) {
    let promise = new Promise((resolve, reject) => {
      User.model.find({}).sort(sort).exec().then((users) => {
        let returnData = []
        let enrichDataPromises = []
        users.forEach((user) => {
          let document = Object.assign({}, user._doc)
          enrichDataPromises.push(User.enrichData(document))
        })

        Promise.all(enrichDataPromises).then((returnData) => {
          resolve(returnData)
        })
      })
    })

    return(promise)
  }

  static findById(id) {
    console.log('user findById')
    let promise = new Promise((resolve, reject) => {
      User.model.findById(id).exec().then((user) => {
        let document = Object.assign({}, user._doc)
        User.enrichData(document).then((returnDocument) => {
          resolve(returnDocument)
        })
      })
    })

    return(promise)
  }

  static filter(filterString, sort) {
    console.log('user filter')
    filterString  = filterString.replace(/"|'/g,'')

    let filterElements = filterString.split(':')

    let filterKey = filterElements[0]

    let filterValues = filterElements[1].split(',')

    let promise = new Promise((resolve, reject) => {
      User.model.find({[filterKey]: {$in: filterValues}}).sort(sort).exec().then((users) => {
        let returnData = []
        let enrichDataPromises = []
        users.forEach((user) => {
          let document = Object.assign({}, user._doc)
          enrichDataPromises.push(User.enrichData(document))
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
    User.getSelectItems(document).then((values) => {
      let selectedItemIndex = 0
      if(values.length > 0) {
        if(values[selectedItemIndex].length > 0) {
          document.role = values[selectedItemIndex][0]
          document.roleName = values[selectedItemIndex][0].name
        }
        selectedItemIndex++
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
    console.log('user getSelectItems')
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
    console.log('user getEmbeddedItems')
    let promise = new Promise((resolve, reject) => {
      let getEmbeddedItemPromises = []

      <%_ embeddedItems.forEach((embeddedItem) => { _%>
      let embeddedItemNamePluralConfig = {
        id: id,
        idField: 'userId',
        dataModel: <%- embeddedItem.className %>,
        lookupIdField: '<%- embeddedItem.name %>Id',
        lookupModel: User_<%- embeddedItem.name %>,
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
    console.log('user search')
    let users = config.users
    let searchString = config.searchString
    let jsFilter = config.jsFilter
    let limit = config.limit

    let promise = new Promise((resolve, reject) => {
      let returnData = {
        info: {
          totalCount: users.length
        },
        documents: []
      }

      if(searchString.length > 0) {
        let searchTerms = searchString.split(/\s/)

        users.forEach(item => {
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

          users.forEach(item => {
            const sandbox = { isFilterMatch : false, item: item }
            vm.createContext(sandbox)
            vm.runInContext(jsFilter, sandbox)

            if(sandbox.isFilterMatch === true) {
              returnData.documents.push(item)
            }
          })
        }
        else {
          returnData.documents = users
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
    console.log('user create')
    let promise = new Promise((resolve, reject) => {
      let newUser = User.model(postData)
      newUser.save().then((user) => {
        <%_ if(parentItem.hasOwnProperty('name')) { _%>
        if(postData.hasOwnProperty('<%- parentItem.name %>Id')) {
          let joinData = {
            <%- parentItem.name %>Id: postData.<%- parentItem.name %>Id,
            userId: user._id
          }
          let new<%- parentItem.className %>_user = <%- parentItem.className %>_user.model(joinData)
          new<%- parentItem.className %>_user.save().then((<%- parentItem.name %>_user) => {
            resolve(user)
          })
        }
        else {
          resolve(user)
        }
        <%_ } else { _%>
        resolve(user)
        <%_ }  _%>
      })
    })
    return(promise)
  }

  static update(id, postData) {
    console.log('user update')
    let filter = {
      "_id": id
    }
    let promise = User.model.findOneAndUpdate(filter, postData).exec()

    return(promise)
  }

  static remove(id) {
    console.log('user remove')
    let filter = {
      "_id": id
    }
    let promise = User.model.findOneAndRemove(filter).exec()

    return(promise)
  }
}

const <%= name %>Schema = new Schema(
  <%- schema %>
);

User.model = mongoose.model('User', userSchema)

// make this available to our users in our Node applications
module.exports = User
