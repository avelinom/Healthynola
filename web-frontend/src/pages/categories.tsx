import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/store/slices/categoriesSlice';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Categories: NextPage = () => {
  const { 
    categories, 
    activeCategories, 
    loading, 
    error, 
    create, 
    update, 
    remove, 
    clear 
  } = useCategories();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: '',
    color: '#1976d2',
    activo: true
  });

  // Load products to count category associations
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  // Function to count products in a category
  const getProductCount = (categoryName: string): number => {
    return products.filter(product => product.categoria === categoryName).length;
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        nombre: category.nombre,
        descripcion: category.descripcion || '',
        color: category.color,
        activo: category.activo
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        nombre: '',
        descripcion: '',
        color: '#1976d2',
        activo: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setCategoryForm({
      nombre: '',
      descripcion: '',
      color: '#1976d2',
      activo: true
    });
    clear();
  };

  const handleInputChange = (field: string, value: any) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await update(editingCategory.id, categoryForm);
      } else {
        await create(categoryForm);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.descripcion && category.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const predefinedColors = [
    '#1976d2', '#2e7d32', '#ff9800', '#9c27b0', 
    '#795548', '#2196f3', '#607d8b', '#e91e63',
    '#ff5722', '#4caf50', '#ffc107', '#673ab7'
  ];

  return (
    <>
      <Head>
        <title>Gestión de Categorías - Healthynola POS</title>
        <meta name="description" content="Gestión de categorías de productos" />
      </Head>

      <Layout title="Gestión de Categorías">
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clear}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon />
                    Categorías de Productos
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Nueva Categoría
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Categories Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Color</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Productos</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: category.color,
                                borderRadius: '50%',
                                border: '1px solid #ccc'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {category.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {category.descripcion || 'Sin descripción'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={category.activo ? 'Activa' : 'Inactiva'}
                              color={category.activo ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {getProductCount(category.nombre)} productos
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(category)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(category.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Category Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={categoryForm.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
              />
              
              <TextField
                fullWidth
                label="Descripción"
                value={categoryForm.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                multiline
                rows={3}
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {predefinedColors.map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: categoryForm.color === color ? '3px solid #000' : '1px solid #ccc',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => handleInputChange('color', color)}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  label="Color personalizado"
                  value={categoryForm.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaletteIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={categoryForm.activo}
                    onChange={(e) => handleInputChange('activo', e.target.checked)}
                  />
                }
                label="Categoría activa"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!categoryForm.nombre.trim()}
            >
              {editingCategory ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default Categories;
