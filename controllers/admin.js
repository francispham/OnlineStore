const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

// For Render Add Product Page (edit-product.ejs):
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

// For Post New Product:
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    // Image Validation:
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        });
    }
    
    // Applying Express Validator: 
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const imageUrl = image.path;

    // Create Product into Database:
    const product = new Product({
        // _id: new mongoose.Types.ObjectId('5ca1aae6c9e9b0558afac0c8'), //This for adding error for testing
        title: title, 
        price: price, 
        description: description, 
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save()
        .then(result => {
            console.log('CREATED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err => {
            // res.redirect('/500');

            // Express Way of Handling Errors:
            const error = new Error(err);
            error.httpStatusCode = 500; //This can be used in app.js line 102
            return next(error);
        });     
};

// For Load Edit Product Page:
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    Product. findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: 'admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// For Save Edited Product:
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    // Applying Express Validator: 
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    // Mongoose Method to Update Product:
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle; 
            product.price = updatedPrice; 
            product.description = updatedDesc; 
            if (image) {
                fileHelper.deleteFile(product.imageUrl); // for Deleting Files
                product.imageUrl = image.path; 
            }
            return product.save()
                .then(result => {
                    console.log('UPDATED PRODUCT!');
                    res.redirect('/admin/products');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// For Render Product Admin Page:
exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id }) //Just find products created by their owner!
        // .select('title price -_id')
        // This Utility Method add more info from User model
        // .populate('userId', 'name') 
        .then(products => {
            console.log(products);
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

/* Before Sending JSON Data:
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next (new Error('Product Not Found.'));
            }
            fileHelper.deleteFile(product.imageUrl); // for Deleting Files
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
*/
exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next (new Error('Product Not Found.'));
            }
            fileHelper.deleteFile(product.imageUrl); // for Deleting Files
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.status(200).json({ message: 'Success!!!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting Product Failed!' });
        });
};













































// 