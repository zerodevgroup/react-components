const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ModelUtil = require('../utils/model-util')

class Role {

  static find(sort) {
    let promise = new Promise((resolve, reject) => {
      Role.model.find({}).sort(sort).exec().then((roles) => {
        let returnData = []
        let enrichDataPromises = []
        roles.forEach((role) => {
          let document = Object.assign({}, role._doc)
          enrichDataPromises.push(Role.enrichData(document))
        })

        Promise.all(enrichDataPromises).then((returnData) => {
          resolve(returnData)
        })
      })
    })

    return(promise)
  }

  static findById(id) {
    console.log('role findById')
    let promise = new Promise((resolve, reject) => {
      Role.model.findById(id).exec().then((role) => {
        let document = Object.assign({}, role._doc)
        Role.enrichData(document).then((returnDocument) => {
          resolve(returnDocument)
        })
      })
    })

    return(promise)
  }

  static filter(filterString, sort) {
    console.log('role filter')
    filterString  = filterString.replace(/"|'/g,'')

    let filterElements = filterString.split(':')

    let filterKey = filterElements[0]

    let filterValues = filterElements[1].split(',')

    let promise = new Promise((resolve, reject) => {
      Role.model.find({[filterKey]: {$in: filterValues}}).sort(sort).exec().then((roles) => {
        let returnData = []
        let enrichDataPromises = []
        roles.forEach((role) => {
          let document = Object.assign({}, role._doc)
          enrichDataPromises.push(Role.enrichData(document))
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
    Role.getSelectItems(document).then((values) => {
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
    console.log('role getSelectItems')
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
    console.log('role getEmbeddedItems')
    let promise = new Promise((resolve, reject) => {
      let getEmbeddedItemPromises = []

      <%_ embeddedItems.forEach((embeddedItem) => { _%>
      let embeddedItemNamePluralConfig = {
        id: id,
        idField: 'roleId',
        dataModel: <%- embeddedItem.className %>,
        lookupIdField: '<%- embeddedItem.name %>Id',
        lookupModel: Role_<%- embeddedItem.name %>,
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
    console.log('role search')
    let roles = config.roles
    let searchString = config.searchString
    let jsFilter = config.jsFilter
    let limit = config.limit

    let promise = new Promise((resolve, reject) => {
      let returnData = {
        info: {
          totalCount: roles.length
        },
        documents: []
      }

      if(searchString.length > 0) {
        let searchTerms = searchString.split(/\s/)

        roles.forEach(item => {
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

          roles.forEach(item => {
            const sandbox = { isFilterMatch : false, item: item }
            vm.createContext(sandbox)
            vm.runInContext(jsFilter, sandbox)

            if(sandbox.isFilterMatch === true) {
              returnData.documents.push(item)
            }
          })
        }
        else {
          returnData.documents = roles
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
    console.log('role create')
    let promise = new Promise((resolve, reject) => {
      let newRole = Role.model(postData)
      newRole.save().then((role) => {
        <%_ if(parentItem.hasOwnProperty('name')) { _%>
        if(postData.hasOwnProperty('<%- parentItem.name %>Id')) {
          let joinData = {
            <%- parentItem.name %>Id: postData.<%- parentItem.name %>Id,
            roleId: role._id
          }
          let new<%- parentItem.className %>_role = <%- parentItem.className %>_role.model(joinData)
          new<%- parentItem.className %>_role.save().then((<%- parentItem.name %>_role) => {
            resolve(role)
          })
        }
        else {
          resolve(role)
        }
        <%_ } else { _%>
        resolve(role)
        <%_ }  _%>
      })
    })
    return(promise)
  }

  static update(id, postData) {
    console.log('role update')
    let filter = {
      "_id": id
    }
    let promise = Role.model.findOneAndUpdate(filter, postData).exec()

    return(promise)
  }

  static remove(id) {
    console.log('role remove')
    let filter = {
      "_id": id
    }
    let promise = Role.model.findOneAndRemove(filter).exec()

    return(promise)
  }
}

const <%= name %>Schema = new Schema(
  <%- schema %>
);

Role.model = mongoose.model('Role', roleSchema)

// make this available to our users in our Node applications
module.exports = Role
