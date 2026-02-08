"use client"

import type React from "react"

interface MarkdownRendererProps {
  content: string
  theme?: "dark" | "light"
}

export function MarkdownRenderer({ content, theme = "dark" }: MarkdownRendererProps) {
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g)

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3)
        const lines = code.split("\n")
        const language = lines[0].trim()
        const codeContent = lines.slice(1).join("\n")

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-border">
            <div className="px-3 py-1.5 text-xs font-mono bg-muted text-muted-foreground border-b border-border">
              {language || "code"}
            </div>
            <pre className="p-3 overflow-x-auto bg-card">
              <code className="font-mono text-[13px] leading-relaxed whitespace-pre text-foreground/90">
                {codeContent}
              </code>
            </pre>
          </div>
        )
      } else {
        return (
          <div key={index} className="max-w-none">
            {renderSimpleMarkdown(part)}
          </div>
        )
      }
    })
  }

  const renderSimpleMarkdown = (text: string) => {
    return text.split("\n").map((line, lineIndex) => {
      if (line.trim() === "") {
        return <br key={lineIndex} />
      }

      if (line.startsWith("# ")) {
        return (
          <h1 key={lineIndex} className="text-xl font-semibold mt-4 mb-2 text-foreground">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={lineIndex} className="text-lg font-semibold mt-3 mb-1.5 text-foreground">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={lineIndex} className="text-base font-semibold mt-2 mb-1 text-foreground">
            {line.slice(4)}
          </h3>
        )
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={lineIndex} className="ml-4 text-foreground/90">
            {processInlineMarkdown(line.slice(2))}
          </li>
        )
      }

      return (
        <p key={lineIndex} className="mb-1.5 text-foreground/90">
          {processInlineMarkdown(line)}
        </p>
      )
    })
  }

  const processInlineMarkdown = (text: string) => {
    const parts: { type: string; content: string; url?: string; placeholder: string }[] = []
    let currentText = text
    let key = 0

    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (_match, content) => {
      const placeholder = `__BOLD_${key}__`
      parts.push({ type: "bold", content, placeholder })
      key++
      return placeholder
    })

    currentText = currentText.replace(/\*(.*?)\*/g, (_match, content) => {
      const placeholder = `__ITALIC_${key}__`
      parts.push({ type: "italic", content, placeholder })
      key++
      return placeholder
    })

    currentText = currentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
      const placeholder = `__LINK_${key}__`
      parts.push({ type: "link", content: text, url, placeholder })
      key++
      return placeholder
    })

    currentText = currentText.replace(/`([^`]+)`/g, (_match, content) => {
      const placeholder = `__CODE_${key}__`
      parts.push({ type: "code", content, placeholder })
      key++
      return placeholder
    })

    let result: React.ReactNode[] = [currentText]

    parts.forEach((part) => {
      result = result.flatMap((item) => {
        if (typeof item === "string" && item.includes(part.placeholder)) {
          const splitText = item.split(part.placeholder)
          const elements: React.ReactNode[] = []

          splitText.forEach((textPart, index) => {
            if (textPart) elements.push(textPart)
            if (index < splitText.length - 1) {
              switch (part.type) {
                case "bold":
                  elements.push(<strong key={`${part.placeholder}-${index}`}>{part.content}</strong>)
                  break
                case "italic":
                  elements.push(<em key={`${part.placeholder}-${index}`}>{part.content}</em>)
                  break
                case "link":
                  elements.push(
                    <a
                      key={`${part.placeholder}-${index}`}
                      href={part.url}
                      className="underline text-primary hover:text-primary/80 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {part.content}
                    </a>,
                  )
                  break
                case "code":
                  elements.push(
                    <code
                      key={`${part.placeholder}-${index}`}
                      className="px-1.5 py-0.5 rounded text-[13px] font-mono bg-muted text-foreground"
                    >
                      {part.content}
                    </code>,
                  )
                  break
              }
            }
          })

          return elements
        }
        return item
      })
    })

    return result
  }

  return <div className="markdown-content">{renderContent(content)}</div>
}
