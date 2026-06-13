package k8s

import (
	"fmt"
	"strings"
	"time"

	gwv1 "sigs.k8s.io/gateway-api/apis/v1"

	"github.com/dhia/routeboard/internal/model"
)

func extractHTTPRouteRoute(hr *gwv1.HTTPRoute, gatewayTLS bool) *model.Route {
	r := &model.Route{
		ID:          fmt.Sprintf("HTTPRoute:%s/%s", hr.Namespace, hr.Name),
		Name:        hr.Name,
		Namespace:   hr.Namespace,
		Source:      model.SourceHTTPRoute,
		Group:       hr.Namespace,
		Labels:      hr.Labels,
		Annotations: hr.Annotations,
		CreatedAt:   hr.CreationTimestamp.Time,
		UpdatedAt:   time.Now(),
	}

	for _, h := range hr.Spec.Hostnames {
		r.Hosts = append(r.Hosts, string(h))
	}

	for _, parent := range hr.Spec.ParentRefs {
		// Fallback heuristic when the parent Gateway can't be read: a listener
		// section named like "https"/"tls" implies TLS.
		if parent.SectionName != nil {
			sn := strings.ToLower(string(*parent.SectionName))
			if strings.Contains(sn, "https") || strings.Contains(sn, "tls") {
				r.TLS = true
			}
		}
		// Record the first Gateway parent as "namespace/name".
		if r.GatewayRef == "" && (parent.Kind == nil || *parent.Kind == "Gateway") {
			ns := hr.Namespace
			if parent.Namespace != nil {
				ns = string(*parent.Namespace)
			}
			r.GatewayRef = ns + "/" + string(parent.Name)
		}
	}
	// Authoritative TLS signal resolved from the parent Gateway's listeners.
	if gatewayTLS {
		r.TLS = true
	}

	for _, rule := range hr.Spec.Rules {
		for _, match := range rule.Matches {
			if match.Path != nil && match.Path.Value != nil {
				r.Paths = append(r.Paths, *match.Path.Value)
			}
		}
		for _, backend := range rule.BackendRefs {
			if r.ServiceName == "" {
				r.ServiceName = string(backend.Name)
				if backend.Port != nil {
					r.ServicePort = fmt.Sprintf("%d", *backend.Port)
				}
			}
		}
	}

	r.URL = computeURL(r)
	r.Title = titleize(r.Name)
	r.Icon = model.DetectIcon(r.ServiceName, r.Name)
	model.ApplyAnnotations(r, hr.Annotations)

	return r
}
