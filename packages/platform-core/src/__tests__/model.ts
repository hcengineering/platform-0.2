export default JSON.parse(`
{
  "model": [
    {
      "_class": "class:core.Class",
      "_id": "class:core.Obj",
      "_kind": 0,
      "_attributes": {}
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.Emb",
      "_kind": 0,
      "_extends": "class:core.Obj",
      "_attributes": {}
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.Doc",
      "_extends": "class:core.Obj",
      "_attributes": {
        "_id": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.RefTo",
            "to": "class:core.Doc"
          }
        },
        "_mixins": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.ArrayOf",
            "of": {
              "_class": "class:core.RefTo",
              "to": "class:core.Doc"
            }
          }
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.VDoc",
      "_extends": "class:core.Doc",
      "_attributes": {
        "_createdOn": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "_createdBy": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "_modifiedOn": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "_modifiedBy": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.Attribute",
      "_extends": "class:core.Emb",
      "_attributes": {
        "type": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.Classifier",
      "_extends": "class:core.Doc",
      "_attributes": {
        "_kind": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "_extends": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.RefTo",
            "to": "class:core.Class"
          }
        },
        "_attributes": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.BagOf",
            "of": {
              "_class": "class:core.InstanceOf",
              "of": "class:core.Type"
            }
          }
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.Class",
      "_extends": "class:core.Classifier",
      "_attributes": {
        "_native": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "_domain": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        }
      },
      "_domain": "model",
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:core.Mixin",
      "_extends": "class:core.Classifier",
      "_attributes": {},
      "_domain": "model",
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:presentation-core.AttributeUI",
      "_extends": "class:core.Attribute",
      "_attributes": {
        "label": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "placeholder": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "icon": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:core.Class",
      "_id": "class:presentation-core.DetailsForm",
      "_extends": "class:core.Class",
      "_attributes": {
        "form": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        }
      },
      "_kind": 1
    },
    {
      "_class": "class:core.Class",
      "_id": "class:workbench.Application",
      "_extends": "class:core.Doc",
      "_attributes": {
        "label": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.String"
          }
        },
        "icon": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "appClass": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        },
        "main": {
          "_class": "class:core.Attribute",
          "type": {
            "_class": "class:core.Type"
          }
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:workbench.Application",
      "_id": "application:recruitment.Recruitment",
      "label": "Найм",
      "icon": "icon:recruitment.Recruitment",
      "main": "component:recruitment.Main",
      "appClass": "class:recruitment.Candidate"
    },
    {
      "_class": "class:core.Class",
      "_id": "class:recruitment.Candidate",
      "_extends": "class:core.VDoc",
      "_attributes": {
        "firstName": {
          "_class": "class:presentation-core.AttributeUI",
          "type": {
            "_class": "class:core.Type"
          },
          "label": "Имя"
        },
        "lastName": {
          "_class": "class:presentation-core.AttributeUI",
          "type": {
            "_class": "class:core.Type"
          },
          "label": "Фамилия"
        }
      },
      "_kind": 0
    },
    {
      "_class": "class:workbench.Application",
      "_id": "application:task.Task",
      "label": "Задачи",
      "icon": "icon:task.Task",
      "main": "component:task.Main",
      "appClass": "class:task.Task"
    },
    {
      "_class": "class:core.Class",
      "_id": "class:task.Task",
      "_extends": "class:core.VDoc",
      "_attributes": {
        "name": {
          "_class": "class:presentation-core.AttributeUI",
          "type": {
            "_class": "class:core.Type"
          },
          "label": "string:task.Task_name"
        },
        "description": {
          "_class": "class:presentation-core.AttributeUI",
          "type": {
            "_class": "class:core.Type"
          },
          "label": "string:task.Task_description"
        }
      },
      "_kind": 0,
      "_mixins": [
        "class:presentation-core.DetailsForm"
      ],
      "class:presentation-core.DetailsForm|form": "component:task.TaskDetails"
    }
  ]
}
`).model
