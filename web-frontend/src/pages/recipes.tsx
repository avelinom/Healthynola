import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useRecipes } from '@/hooks/useRecipes';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProducts } from '@/hooks/useProducts';
import {
  Box,
  Button,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RecipeIcon,
  Calculate as CalculateIcon,
  RemoveCircle as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { Recipe, RecipeIngredient } from '@/store/slices/recipesSlice';

const RecipesPage = () => {
  const { recipes, loading, fetchRecipes, createRecipe, updateRecipe, deleteRecipe, fetchRecipe, addIngredient, deleteIngredient, calculateRecipeCost } = useRecipes();
  const { rawMaterials, fetchRawMaterials } = useRawMaterials();
  const { products, loadProducts } = useProducts();
  const [openModal, setOpenModal] = useState(false);
  const [openIngredientsModal, setOpenIngredientsModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeWithIngredients, setSelectedRecipeWithIngredients] = useState<Recipe | null>(null);
  const [recipeCost, setRecipeCost] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [expandedRecipes, setExpandedRecipes] = useState<Set<number>>(new Set());
  const [recipeDetails, setRecipeDetails] = useState<Map<number, Recipe>>(new Map());
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    productId: '',
    rendimiento: '',
    unidadRendimiento: 'kg',
    notas: ''
  });
  const [ingredientForm, setIngredientForm] = useState({
    rawMaterialId: '',
    cantidad: '',
    unidad: 'kg'
  });

  useEffect(() => {
    setIsClient(true);
    fetchRecipes();
    fetchRawMaterials();
    loadProducts();
  }, []);

  const handleOpenModal = (recipe?: Recipe) => {
    if (recipe) {
      setCurrentRecipe(recipe);
      setFormData({
        nombre: recipe.nombre,
        descripcion: recipe.descripcion || '',
        productId: recipe.productId?.toString() || '',
        rendimiento: recipe.rendimiento.toString(),
        unidadRendimiento: recipe.unidadRendimiento,
        notas: recipe.notas || ''
      });
    } else {
      setCurrentRecipe(null);
      setFormData({
        nombre: '',
        descripcion: '',
        productId: '',
        rendimiento: '',
        unidadRendimiento: 'kg',
        notas: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentRecipe(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.rendimiento) {
      alert('Nombre y rendimiento son requeridos');
      return;
    }

    const recipeData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      productId: formData.productId ? parseInt(formData.productId) : undefined,
      rendimiento: parseFloat(formData.rendimiento),
      unidadRendimiento: formData.unidadRendimiento,
      notas: formData.notas || undefined
    };

    let result = null;
    if (currentRecipe) {
      await updateRecipe(currentRecipe.id, recipeData);
    } else {
      result = await createRecipe(recipeData);
    }

    if (result || currentRecipe) {
      handleCloseModal();
      fetchRecipes();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta receta?')) {
      const success = await deleteRecipe(id);
      if (success) {
        fetchRecipes();
      }
    }
  };

  const handleOpenIngredientsModal = async (recipe: Recipe) => {
    const fullRecipe = await fetchRecipe(recipe.id);
    if (fullRecipe) {
      setSelectedRecipeWithIngredients(fullRecipe);
      setOpenIngredientsModal(true);
      
      // Calculate cost
      const cost = await calculateRecipeCost(recipe.id);
      setRecipeCost(cost);
    }
  };

  const handleCloseIngredientsModal = () => {
    setOpenIngredientsModal(false);
    setSelectedRecipeWithIngredients(null);
    setRecipeCost(null);
    setIngredientForm({
      rawMaterialId: '',
      cantidad: '',
      unidad: 'kg'
    });
  };

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setIngredientForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = async () => {
    if (!ingredientForm.rawMaterialId || !ingredientForm.cantidad) {
      alert('Materia prima y cantidad son requeridos');
      return;
    }

    if (selectedRecipeWithIngredients) {
      const success = await addIngredient(selectedRecipeWithIngredients.id, {
        rawMaterialId: parseInt(ingredientForm.rawMaterialId),
        cantidad: parseFloat(ingredientForm.cantidad),
        unidad: ingredientForm.unidad
      });

      if (success) {
        // Refresh recipe details
        const fullRecipe = await fetchRecipe(selectedRecipeWithIngredients.id);
        if (fullRecipe) {
          setSelectedRecipeWithIngredients(fullRecipe);
        }
        // Recalculate cost
        const cost = await calculateRecipeCost(selectedRecipeWithIngredients.id);
        setRecipeCost(cost);
        
        setIngredientForm({
          rawMaterialId: '',
          cantidad: '',
          unidad: 'kg'
        });
      }
    }
  };

  const handleDeleteIngredient = async (ingredientId: number) => {
    if (selectedRecipeWithIngredients && confirm('¿Eliminar este ingrediente?')) {
      const success = await deleteIngredient(selectedRecipeWithIngredients.id, ingredientId);
      if (success) {
        // Refresh recipe details
        const fullRecipe = await fetchRecipe(selectedRecipeWithIngredients.id);
        if (fullRecipe) {
          setSelectedRecipeWithIngredients(fullRecipe);
        }
        // Recalculate cost
        const cost = await calculateRecipeCost(selectedRecipeWithIngredients.id);
        setRecipeCost(cost);
      }
    }
  };

  const handleToggleExpand = async (recipeId: number) => {
    const newExpanded = new Set(expandedRecipes);
    
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId);
    } else {
      newExpanded.add(recipeId);
      // Load recipe details if not already loaded
      if (!recipeDetails.has(recipeId)) {
        const fullRecipe = await fetchRecipe(recipeId);
        if (fullRecipe) {
          setRecipeDetails(new Map(recipeDetails.set(recipeId, fullRecipe)));
        }
      }
    }
    
    setExpandedRecipes(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!isClient) {
    return (
      <Layout title="Recetas">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Recetas - Healthynola POS</title>
        <meta name="description" content="Gestión de recetas de producción" />
      </Head>

      <Layout title="Recetas">
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Gestión de Recetas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Nueva Receta
          </Button>
        </Box>

        {loading && recipes.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Producto</strong></TableCell>
                  <TableCell><strong>Rendimiento</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No hay recetas registradas. Haga clic en "Nueva Receta" para comenzar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recipes.map((recipe) => {
                    const isExpanded = expandedRecipes.has(recipe.id);
                    const details = recipeDetails.get(recipe.id);
                    
                    return (
                      <React.Fragment key={recipe.id}>
                        <TableRow hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleExpand(recipe.id)}
                                sx={{ mr: 1 }}
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              {recipe.nombre}
                            </Box>
                          </TableCell>
                          <TableCell>{recipe.productName || '-'}</TableCell>
                          <TableCell>{recipe.rendimiento} {recipe.unidadRendimiento}</TableCell>
                          <TableCell>
                            <Chip 
                              label={recipe.activo ? 'Activa' : 'Inactiva'}
                              color={recipe.activo ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleOpenIngredientsModal(recipe)}
                              title="Gestionar Ingredientes"
                            >
                              <RecipeIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenModal(recipe)}
                              title="Editar"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(recipe.id)}
                              title="Eliminar"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Ingredients Row */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ backgroundColor: '#f5f5f5', py: 2 }}>
                              <Box sx={{ pl: 6, pr: 2 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Ingredientes:
                                </Typography>
                                {!details ? (
                                  <CircularProgress size={20} />
                                ) : details.ingredients && details.ingredients.length > 0 ? (
                                  <List dense sx={{ py: 0 }}>
                                    {details.ingredients.map((ingredient, index) => (
                                      <ListItem key={index} sx={{ py: 0, px: 0 }}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="body2">
                                              • {ingredient.rawMaterialName}: <strong>{ingredient.cantidad} {ingredient.unidad}</strong> - {formatCurrency(ingredient.costoCalculado)}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                    <Divider sx={{ my: 1 }} />
                                    <ListItem sx={{ py: 0, px: 0 }}>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            Costo Total: {formatCurrency(
                                              details.ingredients.reduce((sum, ing) => sum + ing.costoCalculado, 0)
                                            )}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No hay ingredientes añadidos. Click en el ícono de receta para añadir.
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal for Create/Edit Recipe */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentRecipe ? 'Editar Receta' : 'Nueva Receta'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nombre de la Receta"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Producto Asociado</InputLabel>
                <Select
                  name="productId"
                  value={formData.productId}
                  label="Producto Asociado"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {products.filter(p => p.activo).map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Rendimiento"
                    name="rendimiento"
                    type="number"
                    value={formData.rendimiento}
                    onChange={handleChange}
                    margin="normal"
                    required
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Unidad</InputLabel>
                    <Select
                      name="unidadRendimiento"
                      value={formData.unidadRendimiento}
                      label="Unidad"
                      onChange={handleChange}
                    >
                      <MenuItem value="kg">Kilogramos (kg)</MenuItem>
                      <MenuItem value="g">Gramos (g)</MenuItem>
                      <MenuItem value="litros">Litros</MenuItem>
                      <MenuItem value="unidades">Unidades</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (currentRecipe ? 'Guardar Cambios' : 'Crear')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal for Managing Ingredients */}
        <Dialog open={openIngredientsModal} onClose={handleCloseIngredientsModal} maxWidth="md" fullWidth>
          <DialogTitle>
            Ingredientes de: {selectedRecipeWithIngredients?.nombre}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Cost Summary */}
              {recipeCost && (
                <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <CalculateIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Costo de Producción
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Costo Total:
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(recipeCost.totalCost)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Costo por {recipeCost.unidadRendimiento}:
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(recipeCost.costoPorUnidad)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Current Ingredients */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Ingredientes Actuales:
              </Typography>
              {selectedRecipeWithIngredients?.ingredients && selectedRecipeWithIngredients.ingredients.length > 0 ? (
                <List>
                  {selectedRecipeWithIngredients.ingredients.map((ingredient) => (
                    <ListItem key={ingredient.id} divider>
                      <ListItemText
                        primary={ingredient.rawMaterialName}
                        secondary={`${ingredient.cantidad} ${ingredient.unidad} - ${formatCurrency(ingredient.costoCalculado)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleDeleteIngredient(ingredient.id)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No hay ingredientes. Añada uno abajo.
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Add Ingredient Form */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Añadir Ingrediente:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>Materia Prima</InputLabel>
                    <Select
                      name="rawMaterialId"
                      value={ingredientForm.rawMaterialId}
                      label="Materia Prima"
                      onChange={handleIngredientChange}
                    >
                      {rawMaterials.filter(rm => rm.activo).map((rm) => (
                        <MenuItem key={rm.id} value={rm.id}>
                          {rm.nombre} ({formatCurrency(rm.costoPorUnidad)}/{rm.unidadMedida})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={ingredientForm.cantidad}
                    onChange={handleIngredientChange}
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Unidad</InputLabel>
                    <Select
                      name="unidad"
                      value={ingredientForm.unidad}
                      label="Unidad"
                      onChange={handleIngredientChange}
                    >
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="litros">litros</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="unidades">unidades</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleAddIngredient}
                    startIcon={<AddIcon />}
                    sx={{ height: '56px' }}
                  >
                    Añadir
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseIngredientsModal} color="primary" variant="contained">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default RecipesPage;
