import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// GET toutes les catégories avec leur ordre
export async function GET() {
  try {
    // Récupérer toutes les catégories uniques
    const bookmarks = await prisma.bookmark.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    
    const categories = bookmarks.map(b => b.category).sort();
    
    // Récupérer l'ordre sauvegardé (on va le stocker dans localStorage côté client)
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
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
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}