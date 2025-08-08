import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Définis l'ordre personnalisé des catégories ici
const CATEGORY_ORDER = [
  'Paris Sportifs',
  'Pronostics',
  'Statistiques',
  'Actualités',
  'Outils',
  'Forums',
  // Les catégories non listées apparaîtront après, par ordre alphabétique
];

// GET all bookmarks (public)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    
    const bookmarks = await prisma.bookmark.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
    });
    
    // Trier les bookmarks selon l'ordre personnalisé des catégories
    bookmarks.sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a.category);
      const indexB = CATEGORY_ORDER.indexOf(b.category);
      
      // Si les deux sont dans la liste, utiliser leur ordre
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si seulement A est dans la liste, il vient en premier
      if (indexA !== -1) return -1;
      
      // Si seulement B est dans la liste, il vient en premier
      if (indexB !== -1) return 1;
      
      // Si aucun n'est dans la liste, ordre alphabétique
      return a.category.localeCompare(b.category);
    });
    
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Error fetching bookmarks' }, { status: 500 });
  }
}

// POST new bookmark (protected)
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Auto-fetch favicon if no logo URL provided
    if (!data.logoUrl) {
      try {
        const domain = new URL(data.url).hostname;
        data.logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (e) {
        // Fallback to default icon
        data.logoUrl = '/default-favicon.png';
      }
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        title: data.title,
        url: data.url,
        description: data.description || null,
        category: data.category,
        logoUrl: data.logoUrl,
        order: data.order || 0,
      },
    });

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json({ error: 'Error creating bookmark' }, { status: 500 });
  }
}

// PUT update bookmark (protected)
export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        title: data.title,
        url: data.url,
        description: data.description || null,
        category: data.category,
        logoUrl: data.logoUrl,
        order: data.order,
      },
    });

    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json({ error: 'Error updating bookmark' }, { status: 500 });
  }
}

// DELETE bookmark (protected)
export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await prisma.bookmark.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Bookmark deleted' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json({ error: 'Error deleting bookmark' }, { status: 500 });
  }
}