import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const dataCart = [...cart];
      const checkProdAlreadyExist = dataCart.find((product) => Number(product.id) === Number(productId));
      const { data: { amount: stockAmount } } = await api.get(`/stock/${productId}`);
      const currentAmount = checkProdAlreadyExist ? checkProdAlreadyExist.amount : 0;
      const amount = currentAmount + 1;

      if(amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (checkProdAlreadyExist) {
        checkProdAlreadyExist.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`)
        const newProduct = {
          ...product.data,
          amount: 1,
        }
        dataCart.push(newProduct);
      }
      setCart(dataCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(dataCart));

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const dataCart = [...cart];
      const newCart = dataCart.filter(product => product.id !== productId);
      if(dataCart.length === newCart.length){
        throw Error();
      }
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    const dataCart = [...cart];
    try {
      const stockAmount = await api.get(`/stock/${productId}`);
      if (amount <= 0) return;
      if(amount > stockAmount.data.amount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      let newDataCart = dataCart.map((element) => {
        if(element.id === productId) {
          return {
            ...element,
            amount
          };
        }
        return element
      });
      setCart(newDataCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newDataCart))
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
