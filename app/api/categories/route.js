import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// GET toutes les catégories avec leur ordre
export async function GET() {
  try {
    // Récupérer toutes les catégories uniques des bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    
    const categories = bookmarks.map(b => b.category).sort();
    
    // Récupérer l'ordre sauvegardé
    const savedOrder = await prisma.categoryOrder.findFirst();
    
    let orderedCategories = categories;
    if (savedOrder && savedOrder.categories && savedOrder.categories.length > 0) {
      // Réorganiser selon l'ordre sauvegardé
      const orderMap = savedOrder.categories;
      orderedCategories = [
        ...orderMap.filter(cat => categories.includes(cat)),
        ...categories.filter(cat => !orderMap.includes(cat))
      ];
    }
    
    return NextResponse.json({ 
      categories: orderedCategories,
      order: savedOrder 
    });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST pour sauvegarder l'ordre des catégories
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categories } = await request.json();
    
    // Supprimer l'ancien ordre s'il existe
    await prisma.categoryOrder.deleteMany();
    
    // Créer le nouvel ordre
    const order = await prisma.categoryOrder.create({
      data: {
        categories: categories
      }
    });
    
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error saving category order:', error);
    return NextResponse.json({ error: 'Error saving category order' }, { status: 500 });
  }
}

// PUT pour renommer une catégorie
export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldName, newName } = await request.json();
    
    // Mettre à jour tous les bookmarks avec cette catégorie
    await prisma.bookmark.updateMany({
      where: { category: oldName },
      data: { category: newName },
    });
    
    // Mettre à jour l'ordre des catégories si nécessaire
    const savedOrder = await prisma.categoryOrder.findFirst();
    if (savedOrder) {
      const updatedCategories = savedOrder.categories.map(cat => 
        cat === oldName ? newName : cat
      );
      
      await prisma.categoryOrder.update({
        where: { id: savedOrder.id },
        data: { categories: updatedCategories }
      });
    }
    
    return NextResponse.json({ message: 'Category renamed successfully' });
  } catch (error) {
    console.error('Error renaming category:', error);
    return NextResponse.json({ error: 'Error renaming category' }, { status: 500 });
  }
}

// DELETE pour supprimer une catégorie (et tous ses bookmarks)
export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Supprimer tous les bookmarks de cette catégorie
    await prisma.bookmark.deleteMany({
      where: { category },
    });
    
    // Mettre à jour l'ordre des catégories
    const savedOrder = await prisma.categoryOrder.findFirst();
    if (savedOrder) {
      const updatedCategories = savedOrder.categories.filter(cat => cat !== category);
      
      await prisma.categoryOrder.update({
        where: { id: savedOrder.id },
        data: { categories: updatedCategories }
      });
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}