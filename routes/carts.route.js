import express from 'express';
import CartsDAO from '../dao/carts.dao.js';
import ProductsDAO from '../dao/products.dao.js';
import Products from '../dao/models/products.schema.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: Cart management
 */

/**
 * @swagger
 * /carts:
 *   get:
 *     summary: Devuelve el carrito del usuario autenticado
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: A user's cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.get('/', async (req, res) => {
    try {
        // Verificar si req.user está definido
        if (!req.user) {
            // Si no está definido, devolver un error 401 (Unauthorized)
            return res.status(401).send('Debe iniciar sesión para ver su carrito');
        }

        const userId = req.user._id;

        // Obtener el carrito asociado al userId
        const userCart = await CartsDAO.getOrCreateCart(userId);

        // Obtener los IDs de los productos asociados al carrito
        const productIds = userCart.products.map(product => product._id);

        // Renderizar la plantilla con los datos del carrito y los IDs de los productos
        res.render('carritos', { cart: userCart, productIds });
    } catch (error) {
        console.error('Error al obtener el carrito del usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});



/**
 * @swagger
 * /carts/{cid}/products/{pid}:
 *   delete:
 *     summary: Remueve un producto del carrito
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product removed from cart
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Internal server error
 */


// Ruta para eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
        const updatedCart = await CartsDAO.deleteProduct(cartId, productId);
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

/**
 * @swagger
 * /carts/add/{productId}:
 *   get:
 *     summary: Agrega un producto al carrito
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product added to cart
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.get('/add/:productId', async (req, res) => {
    const productId = req.params.productId;

    if (!req.user) {
        return res.status(401).send('Debe iniciar sesión para agregar productos al carrito');
    }

    const userId = req.user._id;

    if (!productId) {
        return res.status(400).send('Error: productId no válido');
    }

    try {
        // Obtener o crear el carrito del usuario
        const userCart = await CartsDAO.getOrCreateCart(userId);

        // Agregar el producto al carrito
        await CartsDAO.addToCart(userCart._id, productId, userId);

        res.redirect('/carts');
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});






router.post('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const { products } = req.body; // Se espera que el formulario envíe los productos actualizados

    try {
        const updatedCart = await CartsDAO.updateCart(cartId, products);
        res.redirect('/carts');
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/:cartId/remove', async (req, res) => {
    try {
        const { cartId } = req.params;
        await CartsDAO.removeCart(cartId);
        res.redirect('/carts'); // O redirige a donde necesites después de eliminar el carrito
    } catch (error) {
        console.error('Error al eliminar el carrito:', error);
        res.status(500).send('Error al eliminar el carrito');
    }
});



router.get('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const cart = await CartsDAO.getCartById(cartId);
        console.log('Carrito:', JSON.stringify(cart, null, 2)); // Esto imprimirá el carrito en la consola
        res.render('cart', { cart });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});



export default router;



