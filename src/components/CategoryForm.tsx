
import { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Category } from '@/lib/db';
import { DEFAULT_CATEGORY_ID } from '@/lib/db';

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, { message: 'Cor inválida' }),
  icon: z.string().min(1, { message: 'Ícone é obrigatório' }),
  type: z.enum(['expense', 'income'], { required_error: 'Tipo é obrigatório' }),
});

type FormValues = z.infer<typeof formSchema>;

const ICON_OPTIONS = [
  { value: 'home', label: 'Casa' },
  { value: 'car', label: 'Carro' },
  { value: 'utensils', label: 'Alimentação' },
  { value: 'shopping-bag', label: 'Compras' },
  { value: 'heart', label: 'Saúde' },
  { value: 'film', label: 'Lazer' },
  { value: 'book', label: 'Educação' },
  { value: 'gift', label: 'Presente' },
  { value: 'briefcase', label: 'Trabalho' },
  { value: 'wallet', label: 'Salário' },
  { value: 'trending-up', label: 'Investimentos' },
  { value: 'help-circle', label: 'Outros' },
];

const COLOR_OPTIONS = [
  { value: '#00A86B', label: 'Verde' },
  { value: '#1A73E8', label: 'Azul' },
  { value: '#FFC107', label: 'Amarelo' },
  { value: '#E53935', label: 'Vermelho' },
  { value: '#6200EA', label: 'Roxo' },
  { value: '#FF6D00', label: 'Laranja' },
  { value: '#00BCD4', label: 'Ciano' },
  { value: '#888888', label: 'Cinza' },
];

interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
  const { addCategory, updateCategory } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isDefault = category?.id === DEFAULT_CATEGORY_ID;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: category?.id,
      name: category?.name || '',
      color: category?.color || '#00A86B',
      icon: category?.icon || 'help-circle',
      type: category?.type || 'expense',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        type: category.type,
      });
    } else {
      form.reset({
        name: '',
        color: '#00A86B',
        icon: 'help-circle',
        type: 'expense',
      });
    }
  }, [category, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const categoryData = {
        ...values,
        createdAt: category?.createdAt || new Date(),
      };
      
      if (category?.id) {
        await updateCategory(categoryData as Category);
        toast.success('Categoria atualizada com sucesso');
      } else {
        await addCategory(categoryData);
        toast.success('Categoria adicionada com sucesso');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-medium">
          {category ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={isDefault} 
                  placeholder="Nome da categoria" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isDefault}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isDefault}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: field.value }}
                        ></div>
                        <span>
                          {COLOR_OPTIONS.find(color => color.value === field.value)?.label || 'Cor'}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isDefault}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ícone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isDefault}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        
        {isDefault && (
          <p className="text-sm text-amber-500">
            A categoria padrão "Sem Categoria" não pode ser modificada.
          </p>
        )}
      </form>
    </Form>
  );
};

export default CategoryForm;
