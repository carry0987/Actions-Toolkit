import * as core from '@actions/core';
import type { SummaryTableRow, SummaryImageOptions } from '@actions/core/lib/summary';

export class Summary {
    /**
     * Add a heading
     */
    static addHeading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1): Summary {
        core.summary.addHeading(text, level);

        return this;
    }

    /**
     * Add a paragraph or plain text
     */
    static addParagraph(text: string): Summary {
        core.summary.addRaw(`<p>${text}</p>`).addEOL();

        return this;
    }

    /**
     * Add raw HTML or markdown
     */
    static addRaw(text: string, addEOL = false): Summary {
        core.summary.addRaw(text, addEOL);

        return this;
    }

    /**
     * Add a code block
     */
    static addCodeBlock(code: string, lang?: string): Summary {
        core.summary.addCodeBlock(code, lang);

        return this;
    }

    /**
     * Add a list
     */
    static addList(items: string[], ordered = false): Summary {
        core.summary.addList(items, ordered);

        return this;
    }

    /**
     * Add a table
     */
    static addTable(rows: SummaryTableRow[]): Summary {
        core.summary.addTable(rows);

        return this;
    }

    /**
     * Add a link
     */
    static addLink(text: string, url: string): Summary {
        core.summary.addLink(text, url);

        return this;
    }

    /**
     * Add a separator
     */
    static addSeparator(): Summary {
        core.summary.addSeparator();

        return this;
    }

    /**
     * Add a line break
     */
    static addBreak(): Summary {
        core.summary.addBreak();

        return this;
    }

    /**
     * Add a quote (block quote)
     */
    static addQuote(text: string): Summary {
        core.summary.addQuote(text);

        return this;
    }

    /**
     * Add an image
     */
    static addImage(src: string, alt: string, options?: SummaryImageOptions): Summary {
        core.summary.addImage(src, alt, options);

        return this;
    }

    /**
     * Add a collapsible details block
     */
    static addDetails(label: string, content: string): Summary {
        core.summary.addDetails(label, content);

        return this;
    }

    /**
     * Write summary to file
     */
    static async write(overwrite = false): Promise<void> {
        await core.summary.write({ overwrite });
    }

    /**
     * Clear summary and overwrite
     */
    static async clear(): Promise<void> {
        await core.summary.clear();
    }
}
