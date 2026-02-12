import { BadRequestException, Injectable } from '@nestjs/common';
import { IndexFlatL2 } from 'faiss-node';

@Injectable()
export class FaissService {
  private index: IndexFlatL2;
  private readonly DIMENSIONS = 1536;

  private metadata: {
    text: string;
    docId: string;
    page: number;
  }[] = [];

  constructor() {
    this.index = new IndexFlatL2(this.DIMENSIONS);
  }

  addVectors(
    vectors: number[][],
    metadatas: { text: string; docId: string; page: number }[],
  ) {
    if (!vectors.length) {
      throw new BadRequestException('No vectors provided');
    }

    if (vectors.length !== metadatas.length) {
      throw new BadRequestException('Vectors and metadata length mismatch');
    }

    vectors.forEach((v, i) => {
      if (v.length !== this.DIMENSIONS) {
        throw new BadRequestException(
          `Vector at index ${i} must have ${this.DIMENSIONS} dimensions`,
        );
      }
    });

    const flat = new Float32Array(vectors.length * this.DIMENSIONS);

    let offset = 0;
    for (const vector of vectors) {
      flat.set(vector, offset);
      offset += this.DIMENSIONS;
    }

    this.index.add(Array.from(flat));
    this.metadata.push(...metadatas);

    return {
      success: true,
      indexed: vectors.length,
    };
  }

  search(queryVector: number[], topK = 5) {
    if (queryVector.length !== this.DIMENSIONS) {
      throw new BadRequestException(
        `Query vector must have ${this.DIMENSIONS} dimensions`,
      );
    }

    const query = new Float32Array(queryVector);

    const { distances, labels } = this.index.search(Array.from(query), topK);

    return labels.map((id: number, i: number) => ({
      score: distances[i],
      ...this.metadata[id],
    }));
  }
}
