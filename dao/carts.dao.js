import Cart from './models/cart.schema.js';
import ProductsDAO from './products.dao.js';
import mongoose from 'mongoose';
import UsersDAO from './users.dao.js';
import { ObjectId } from 'mongoose';
import { Types } from 'mongoose';

const newObjectId = new Types.ObjectId();
class CartsDAO {
    static async deleteProduct(cartId, productId) {
        try {
            const cart = await Cart.findByIdAndUpdate(
                cartId,
                { $pull: { products: { productId } } },
                { new: true }
            ).populate('products.productId');

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            return cart;
        } catch (error) {
            console.error('Error en deleteProduct:', error);
            throw error;
        }
    }

    

    static async addToCart(cartId, productId, userId) {
        try {
            // Obtener el producto completo, incluido su título y precio
            const product = await ProductsDAO.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
    
            // Verificar si el usuario es premium
            const user = await UsersDAO.getUserByID(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
    
            // Verificar si el usuario es premium
            if (user.role === 'premium') {
                // Obtener el producto
                const product = await ProductsDAO.getById(productId);
                if (!product) {
                    return res.status(404).send('Producto no encontrado');
                }

                // Verificar si el producto tiene propietario y si es el mismo usuario premium
                if (product.owner === user.email) {
                    return res.status(403).send('Un usuario premium no puede agregar su propio producto al carrito.');
                }
            }
    
            const { title, price } = product; // Extraer el título y el precio del producto
    
            // Agregar el producto al carrito del usuario
            const updatedCart = await Cart.findByIdAndUpdate(
                cartId,
                { $push: { products: { productId, title, price, quantity: 1 } } },
                { new: true }
            ).populate('products.productId');
    
            return updatedCart;
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
            throw error;
        }
    }
    
    
    
    
    
    
    
    
    
    
    
    static async updateCart(cartId, products) {
        try {
            const updatedCart = await Cart.findByIdAndUpdate(
                cartId,
                { products },
                { new: true }
            ).populate('products.productId');
            return updatedCart;
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
            throw error;
        }
    }

    static async removeCart(cartId) {
        try {
            const result = await Cart.findByIdAndDelete(cartId);
            return result;
        } catch (error) {
            console.error('Error al eliminar el carrito:', error);
            throw error;
        }
    }
    
    
    static async getOrCreateCart(userId) {
        try {
            // Buscar un carrito asociado con el usuario actual
            let userCart = await Cart.findOne({ userId }).populate('products');
    
            // Si no hay un carrito asociado, crear uno nuevo
            if (!userCart) {
                userCart = new Cart({ userId, products: [] });
                await userCart.save();
            }
    
            return userCart;
        } catch (error) {
            console.error('Error al obtener o crear el carrito:', error);
            throw error;
        }
    }    
    
    static async getCartById(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.productId');
            return cart;
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw error;
        }
    }
      
};

export default CartsDAO;



