## Motivation

Mixins are great, but does not play well with spaces/security model. Let's consider `Contact` object and `Candidate` mixin, which can be attached to `Contact`. 
Let me also remind that objects are stored in `Spaces` and we have to store `Contact` objects somewhere. Consider we want to create `Candidate` which implies `Contact` to be created and `Candidate` attached to the `Contact`. We may create `Contact/Candidate` object in some `Pool of Candidates` space which is visible to relevant persons, but result in following problems:

* This `Contact` is not visible to users who does not have access to `Pool of Candidates` resulting in duplicate contact to be created if this person appear somewhere else in the system.
* When this `Candidate` becomes `Employee`, where `Contact/Candidate/Employee` will live? If we move it to `Employees` space, all the `Candidate` information will be accessible to people having access to `Employees` space which may be not what company wants.

If we will create `Contact/Candidate` in a shared `All Contacts` space, we will not be able to manage secure access to `Candidate` information using current security model.

## Proposed Solution

Let's leave `mixin` concept as is and introduce `Linked Object` concept. `Linked Objects` lives in their respective spaces and must be connected to a 'parent' object. Parent tracks all the linked objects and knows spaces where they lives. So we may either restrict access to the parent object (`Contact`) if user does not have an access to any of the linked objects or make parent always accessible. Access to Linked Objects will be determined by space access so if `Candidate` lives in the `Pool of Candidates` this `Candidate` linked object accessible only to users having access to the `Pool of Candidates`.

When user creates Linked Object such as `Candidate`, she must select or create a parent (`Contact`). She should also specify spaces to keep parent (`Contact`) and linked object (`Candidate`), though UI can propose default spaces to store object depending on interactions flow.
